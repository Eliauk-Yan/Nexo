package com.nexo.business.inventory.interfaces.facade;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;
import com.nexo.common.api.common.response.ResponseCode;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.product.response.data.ProductInventoryDTO;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;
import org.redisson.api.RScript;
import org.redisson.api.RedissonClient;
import org.redisson.client.RedisException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

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
    private ArtWorkFacade artWorkFacade;

    /**
     * 本地缓存
     */
    private Cache<String, Boolean> soldOutProductLocalCache;

    /**
     * Redisson客户端
     */
    private final RedissonClient redissonClient;

    private String decreaseScript;

    @PostConstruct
    public void init() throws IOException {
        // 初始化本地缓存
        soldOutProductLocalCache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES) // 1. 设置缓存过期时间为 1 分钟
                .maximumSize(3000) // 2. 设置缓存最大容量为 3000
                .build();
        // 读取扣减库存的 Lua 脚本
        ClassPathResource resource = new ClassPathResource("decrease.lua");
        decreaseScript = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }

    @Override
    public InventoryResponse<ProductInventoryDTO> getInventory(String productId, ProductType productType) {
        return switch (productType) {
            case ARTWORK -> {
                ArtWorkQueryResponse<ArtworkInventoryDTO> response = artWorkFacade
                        .getArtworkInventory(Long.parseLong(productId));
                if (response.getSuccess()) {
                    InventoryResponse<ProductInventoryDTO> inventoryResponse = new InventoryResponse<>();
                    inventoryResponse.setSuccess(true);
                    inventoryResponse.setCode(ResponseCode.SUCCESS.name());
                    inventoryResponse.setMessage(ResponseCode.SUCCESS.getMessage());
                    inventoryResponse.setData(response.getData());
                    yield inventoryResponse;
                }
                yield null;
            }
            case BLIND_BOX -> null;
        };
    }

    @Override
    public InventoryResponse<Boolean> decreaseInventory(OrderCreateRequest request) {
        InventoryResponse<Boolean> response = new InventoryResponse<>();
        // 1. 获取商品类型（如：数字藏品、盲盒）
        ProductType productType = request.getProductType();
        // 2. 检查本地缓存:如果本地缓存命中，说明该商品已卖完，直接拦截请求，不再查 Redis，实现快速失败
        if (soldOutProductLocalCache.getIfPresent(productType + SEPARATOR + request.getProductId()) != null) {
            response.setSuccess(false);
            response.setData(false);
            response.setCode(ResponseCode.FAIL.name());
            response.setMessage("库存不足");
            return response;
        }
        // TODO 后续优化为模板方法设计模式
        if (productType == ProductType.ARTWORK) {
            try {
                // 3. 执行Lua脚本 扣减库存
                Long result = redissonClient.getScript().eval(RScript.Mode.READ_WRITE,
                        decreaseScript,
                        RScript.ReturnType.LONG,
                        Arrays.asList("artwork:inventory:" + request.getProductId(),
                                "artwork:inventory:stream:" + request.getProductId()), // 库存 key 与 流水 key
                        request.getItemCount(), "DECREASE_" + request.getIdentifier());// 扣减数量与唯一标识
                // 如果库存为 0，则在本地缓存记录，用于对售罄商品快速决策
                if (result == 0) {
                    soldOutProductLocalCache.put(productType + SEPARATOR + request.getProductId(), true);
                }
            } catch (RedisException e) {
                log.error("库存扣减错误 , 商品ID = {} , 幂等号 = {} ,", request.getProductId(), request.getIdentifier(), e);
                response.setSuccess(false);
                response.setData(false);
                response.setCode(ResponseCode.FAIL.name());
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
    public InventoryResponse<String> getInventoryDecreaseLog(OrderCreateRequest request) {
        // TODO 后续改为模板方法
        if (request.getProductType() == ProductType.ARTWORK) {
            // 1. 编写 Lua 脚本
            String luaScript = "return redis.call('hget', KEYS[1], ARGV[1])";
            // 2. 执行 Lua 脚本
            String result = redissonClient.getScript().eval(
                    RScript.Mode.READ_ONLY,
                    luaScript,
                    RScript.ReturnType.VALUE, // ReturnType 为 VALUE 以获取字符串结果
                    List.of("artwork:inventory:stream:" + request.getProductId()),
                    "DECREASE_" + request.getIdentifier());
            // 3. 返回结果
            InventoryResponse<String> response = new InventoryResponse<>();
            response.setSuccess(true);
            response.setData(result);
            response.setCode(ResponseCode.SUCCESS.name());
            response.setMessage(ResponseCode.SUCCESS.getMessage());
            return response;
        }
        throw new UnsupportedOperationException("不支持商品类型");
    }

    @Override
    public InventoryResponse<String> getInventoryIncreaseLog(OrderCreateRequest request) {
        // TODO 后续改为模板方法
        if (request.getProductType() == ProductType.ARTWORK) {
            // 1. 编写 Lua 脚本
            String luaScript = "return redis.call('hget', KEYS[1], ARGV[1])";
            // 2. 执行 Lua 脚本
            String result = redissonClient.getScript().eval(
                    RScript.Mode.READ_ONLY,
                    luaScript,
                    RScript.ReturnType.VALUE, // ReturnType 为 VALUE 以获取字符串结果
                    List.of("artwork:inventory:stream:" + request.getProductId()),
                    "INCREASE_" + request.getIdentifier());
            // 3. 返回结果
            InventoryResponse<String> response = new InventoryResponse<>();
            response.setSuccess(true);
            response.setData(result);
            response.setCode(ResponseCode.SUCCESS.name());
            response.setMessage(ResponseCode.SUCCESS.getMessage());
            return response;
        }
        throw new UnsupportedOperationException("不支持商品类型");
    }

    @Override
    public InventoryResponse<Long> removeInventoryDecreaseLog(OrderCreateRequest request) {
        // TODO 后续改为模板方法
        if (request.getProductType() == ProductType.ARTWORK) {
            // 1. 编写 Lua 脚本
            String luaScript = "return redis.call('hdel', KEYS[1], ARGV[1])";
            // 2. 执行 Lua 脚本
            Long result = redissonClient.getScript().eval(
                    RScript.Mode.READ_ONLY,
                    luaScript,
                    RScript.ReturnType.LONG, // ReturnType 为 LONG 以获取长整型结果
                    List.of("artwork:inventory:stream:" + request.getProductId()),
                    "INCREASE_" + request.getIdentifier());
            // 3. 返回结果
            InventoryResponse<Long> response = new InventoryResponse<>();
            response.setSuccess(true);
            response.setData(result);
            response.setCode(ResponseCode.SUCCESS.name());
            response.setMessage(ResponseCode.SUCCESS.getMessage());
            return response;
        }
        throw new UnsupportedOperationException("不支持商品类型");
    }
}
