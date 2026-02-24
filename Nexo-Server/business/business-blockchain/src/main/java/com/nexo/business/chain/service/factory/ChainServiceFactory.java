package com.nexo.business.chain.service.factory;

import com.nexo.common.api.blockchain.constant.ChainType;
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

    private final Map<ChainType, ChainService> blockchainServiceMap = new EnumMap<>(ChainType.class);

    public ChainServiceFactory(List<ChainService> services) {
        for (ChainService service : services) {
            blockchainServiceMap.put(service.getChainType(), service);
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
