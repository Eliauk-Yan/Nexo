package com.nexo.business.chain.service.factory;

import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.domain.exception.ChainErrorCode;
import com.nexo.business.chain.domain.exception.ChainException;
import com.nexo.business.chain.service.ChainService;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * @classname BlockchainServiceFactory
 * @description 区块链服务工厂类
 * @date 2025/12/25 16:07
 * @created by YanShijie
 */
@Component
public class ChainServiceFactory {


    /**
     * Map 实现类对比：
     * +-------------------+------------+------------+----------------------------------+
     * | Map 类型           | 线程安全    | 并发性能    | 说明                              |
     * +-------------------+------------+------------+----------------------------------+
     * | HashMap           | 否         | 高         | 需外部保证线程安全                  |
     * | Hashtable         | 是         | 低         | 方法级 synchronized，已淘汰        |
     * | ConcurrentHashMap | 是         | 高         | CAS + 局部加锁，适合高并发场景      |
     * +-------------------+------------+------------+---------------------------------+
     */
    private final Map<ChainType, ChainService> blockchainServiceMap = new EnumMap<>(ChainType.class);

    public ChainServiceFactory(List<ChainService> services) {
        for (ChainService service : services) {
            blockchainServiceMap.put(service.supportType(), service);
        }
    }

    public ChainService get(ChainType chainType) {
        // 1. 并从map中获取对应的bean.
        ChainService chainService = blockchainServiceMap.get(chainType);
        // 2. 判断对应实现类是否存在
        if (chainService != null) {
            return chainService;
        } else {
            throw new ChainException(ChainErrorCode.BLOCKCHAIN_TYPE_NOT_FOUND);
        }
    }

}
