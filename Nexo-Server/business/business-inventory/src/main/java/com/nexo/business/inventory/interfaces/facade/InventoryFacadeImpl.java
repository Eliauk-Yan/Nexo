package com.nexo.business.inventory.interfaces.facade;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.base.response.ResponseCode;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.constant.NFTType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;
import org.redisson.api.RMap;
import org.redisson.api.RScript;
import org.redisson.api.RedissonClient;
import org.redisson.client.RedisException;
import org.redisson.client.codec.StringCodec;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static com.nexo.common.api.nft.constant.NFTType.NFT;
import static com.nexo.common.base.constant.CommonConstant.SEPARATOR;

/**
 * @classname InventoryFacadeImpl
 * @description 库存模块Dubbo服务实现类
 * @date 2026/02/08 00:17
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
@Slf4j
public class InventoryFacadeImpl implements InventoryFacade {

    /**
     * 藏品Dubbo接口
     */
    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;

    /**
     * 本地缓存
     */
    private Cache<String, Boolean> soldOutProductLocalCache;

    /**
     * Redisson客户端
     */
    private final RedissonClient redissonClient;

    /**
     * 扣减库存的 Lua 脚本
     */
    private String decreaseScript;

    /**
     * 回滚(增加)库存的 Lua 脚本
     */
    private String increaseScript;

    @PostConstruct
    public void init() throws IOException {
        // 初始化本地缓存
        soldOutProductLocalCache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES) // 1. 设置缓存过期时间为 1 分钟
                .maximumSize(3000) // 2. 设置缓存最大容量为 3000
                .build();
        // 读取扣减库存的 Lua 脚本
        ClassPathResource decreaseResource = new ClassPathResource("decrease.lua");
        decreaseScript = StreamUtils.copyToString(decreaseResource.getInputStream(), StandardCharsets.UTF_8);
        // 读取回滚库存的 Lua 脚本
        ClassPathResource increaseResource = new ClassPathResource("increase.lua");
        increaseScript = StreamUtils.copyToString(increaseResource.getInputStream(), StandardCharsets.UTF_8);
    }

    @Override
    public InventoryResponse<Long> getInventory(InventoryRequest request) {
        // 1. 构造响应对象
        InventoryResponse<Long> response = new InventoryResponse<>();
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        // 2. 获取商品类型
        NFTType nftType = request.getNftType();
        // 3. 检查本地缓存商品是否售罄
        if (soldOutProductLocalCache.getIfPresent(nftType + SEPARATOR + request.getNftId()) != null) {
            // 3.1 已售罄直接返回
            response = new InventoryResponse<>();
            response.setData(0L);
            return response;
        }
        // 4. 从 Redis 获取库存并返回
        String stock = (String) redissonClient.getBucket("nft:inventory:" + request.getNftId(), StringCodec.INSTANCE).get();
        response.setData(Long.parseLong(stock));
        return response;
    }

    @Override
    public InventoryResponse<Boolean> invalid(InventoryRequest inventoryRequest) {
        // 1. 删除Redis库存
        if (redissonClient.getBucket("nft:inventory:" + inventoryRequest.getNftId(), StringCodec.INSTANCE).isExists()) {
            redissonClient.getBucket("nft:inventory:" + inventoryRequest.getNftId(), StringCodec.INSTANCE).delete();
        }
        // 2. 删除Redis库存流水
        if (redissonClient.getBucket("nft:inventory:stream:" + inventoryRequest.getNftId(), StringCodec.INSTANCE).isExists()) {
            // 让流水记录的过期时间设置为24小时后，这样可以避免流水记录立即过期，对账出现问题
            redissonClient.getBucket("nft:inventory:stream:" + inventoryRequest.getNftId(), StringCodec.INSTANCE).expire(Instant.now().plus(24, ChronoUnit.HOURS));
        }
        // 3. 清楚售罄本地缓存
        soldOutProductLocalCache.invalidate(inventoryRequest.getNftType() + SEPARATOR + inventoryRequest.getNftId());
        return InventoryResponse.success(true);
    }

    @Override
    public InventoryResponse<Boolean> decreaseInventory(InventoryRequest request) {
        InventoryResponse<Boolean> response = new InventoryResponse<>();
        // 1. 获取商品类型（如：数字藏品、盲盒）
        NFTType nftType = request.getNftType();
        // 2. 检查本地缓存:如果本地缓存命中，说明该商品已卖完，直接拦截请求，不再查 Redis，实现快速失败
        if (soldOutProductLocalCache.getIfPresent(nftType + SEPARATOR + request.getNftId()) != null) {
            response.setSuccess(false);
            response.setData(false);
            response.setCode(ResponseCode.FAIL.getCode());
            response.setMessage("库存不足");
            return response;
        }
        if (nftType == NFT) {
            try {
                // 3. 执行Lua脚本 扣减库存
                Long result = redissonClient.getScript(StringCodec.INSTANCE).eval(RScript.Mode.READ_WRITE,
                        decreaseScript,
                        RScript.ReturnType.LONG,
                        Arrays.asList("nft:inventory:" + request.getNftId(),
                                "nft:inventory:stream:" + request.getNftId()), // 库存 key 与 流水 key
                        request.getInventory(), "DECREASE_" + request.getIdentifier());// 扣减数量与唯一标识
                // 如果库存为 0，则在本地缓存记录，用于对售罄商品快速决策
                if (result == 0) {
                    soldOutProductLocalCache.put(nftType + SEPARATOR + request.getNftId(), true);
                }
            } catch (RedisException e) {
                log.error("库存扣减错误 , 商品ID = {} , 幂等号 = {} ,", request.getNftId(), request.getIdentifier(), e);
                response.setSuccess(false);
                response.setData(false);
                response.setCode(ResponseCode.FAIL.getCode());
                response.setMessage("库存扣减错误");
                return response;
            }
        } else {
            throw new UnsupportedOperationException("不支持商品类型");
        }
        // 4. 返回结果
        response.setSuccess(true);
        response.setData(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        return response;
    }

    @Override
    public InventoryResponse<Boolean> increaseInventory(InventoryRequest request) {
        InventoryResponse<Boolean> response = new InventoryResponse<>();
        NFTType nftType = request.getNftType();

        // 如果本地缓存命中说明之前售罄过，现在有库存了可以清理掉本地售罄标识
        soldOutProductLocalCache.invalidate(nftType + SEPARATOR + request.getNftId());

        if (nftType == NFT) {
            try {
                // 执行Lua脚本 增加库存
                Long result = redissonClient.getScript(StringCodec.INSTANCE).eval(RScript.Mode.READ_WRITE,
                        increaseScript,
                        RScript.ReturnType.LONG,
                        Arrays.asList("nft:inventory:" + request.getNftId(),
                                "nft:inventory:stream:" + request.getNftId()), // 库存 key 与 流水 key
                        request.getInventory(), "INCREASE_" + request.getIdentifier());// 加回数量与唯一标识

                log.info("Redis库存回滚成功, 商品ID = {}, 当前库存 = {}", request.getNftId(), result);
            } catch (RedisException e) {
                // 如果是 Lua 中的 redis.error_reply 返回的 OPERATION_ALREADY_EXECUTED，属于正常幂等现象
                if (e.getMessage() != null && e.getMessage().contains("OPERATION_ALREADY_EXECUTED")) {
                    log.info("库存回滚幂等, 商品ID = {} , 幂等号 = {}", request.getNftId(), request.getIdentifier());
                } else {
                    log.error("库存回滚错误 , 商品ID = {} , 幂等号 = {} ,", request.getNftId(), request.getIdentifier(), e);
                    response.setSuccess(false);
                    response.setData(false);
                    response.setCode(ResponseCode.FAIL.getCode());
                    response.setMessage("库存回滚错误");
                    return response;
                }
            }
        } else {
            throw new UnsupportedOperationException("不支持商品类型");
        }

        response.setSuccess(true);
        response.setData(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        return response;
    }

    @Override
    public InventoryResponse<String> getInventoryDecreaseLog(InventoryRequest request) {
        // 1. 判断商品类型为NFT
        if (request.getNftType() == NFT) {
            String hashKey = "nft:inventory:stream:" + request.getNftId();
            String field = "DECREASE_" + request.getIdentifier();
            // 2. 查询库存扣减日志
            RMap<String, String> map = redissonClient.getMap(hashKey, StringCodec.INSTANCE);
            String result = map.get(field);
            if (result == null) {
                log.warn("检查库存日志为空, hashKey={}, field={}, mapSize={}, availableKeys={}",
                        hashKey, field, map.size(), map.keySet());
            }
            // 3. 返回结果
            return InventoryResponse.success(result);
        }
        throw new UnsupportedOperationException("不支持商品类型");
    }

    @Override
    public InventoryResponse<String> getInventoryIncreaseLog(InventoryRequest request) {
        if (request.getNftType() == NFT) {
            // 1. 编写 Lua 脚本
            String luaScript = "return redis.call('hget', KEYS[1], ARGV[1])";
            // 2. 执行 Lua 脚本
            String result = redissonClient.getScript(StringCodec.INSTANCE).eval(
                    RScript.Mode.READ_ONLY,
                    luaScript,
                    RScript.ReturnType.VALUE, // ReturnType 为 VALUE 以获取字符串结果
                    List.of("nft:inventory:stream:" + request.getNftId()),
                    "INCREASE_" + request.getIdentifier());
            // 3. 返回结果
            return InventoryResponse.success(result);
        }
        throw new UnsupportedOperationException("不支持商品类型");
    }

    @Override
    public InventoryResponse<Long> removeInventoryDecreaseLog(InventoryRequest request) {
        if (request.getNftType() == NFT) {
            // 1. 编写 Lua 脚本
            String luaScript = "return redis.call('hdel', KEYS[1], ARGV[1])";
            // 2. 执行 Lua 脚本
            Long result = redissonClient.getScript(StringCodec.INSTANCE).eval(
                    RScript.Mode.READ_WRITE,
                    luaScript,
                    RScript.ReturnType.LONG, // ReturnType 为 LONG 以获取长整型结果
                    List.of("nft:inventory:stream:" + request.getNftId()),
                    "DECREASE_" + request.getIdentifier());
            // 3. 返回结果
            return InventoryResponse.success(result);
        }
        throw new UnsupportedOperationException("不支持商品类型");
    }

    @Override
    public InventoryResponse<Boolean> init(InventoryRequest request) {
        if (request.getNftType() == NFT) {
            // 1. 构造库存响应对象
            InventoryResponse<Boolean> inventoryResponse = new InventoryResponse<>();
            // 2. 检查库存是否存在
            if (redissonClient.getBucket("nft:inventory:" + request.getNftId()).isExists()) {
                inventoryResponse.setSuccess(true);
                inventoryResponse.setCode(ResponseCode.DUPLICATED.getCode());
                return inventoryResponse;
            }
            // 3. 初始化库存 指定解码器 StringCodec.INSTANCE
            redissonClient.getBucket("nft:inventory:" + request.getNftId(), StringCodec.INSTANCE)
                    .set(request.getInventory());
            inventoryResponse.setSuccess(true);
            inventoryResponse.setCode(ResponseCode.SUCCESS.getCode());
            inventoryResponse.setData(true);
            return inventoryResponse;
        }
        throw new UnsupportedOperationException("不支持商品类型");
    }
}
