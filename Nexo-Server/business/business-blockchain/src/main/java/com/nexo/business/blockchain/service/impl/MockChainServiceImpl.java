package com.nexo.business.blockchain.service.impl;

import com.nexo.business.blockchain.domain.enums.ChainType;
import com.nexo.business.blockchain.service.impl.base.AbstractChainService;
import org.springframework.stereotype.Service;

/**
 * @classname MockChainServiceImpl
 * @description MOCK 区块链服务实现类
 * @date 2025/12/25 15:47
 */
@Service("mockChainService")
public class MockChainServiceImpl extends AbstractChainService {

    @Override
    public ChainType supportType() {
        return ChainType.MOCK;
    }
}
