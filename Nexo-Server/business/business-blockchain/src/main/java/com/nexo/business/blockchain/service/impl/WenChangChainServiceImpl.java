package com.nexo.business.blockchain.service.impl;

import com.nexo.business.blockchain.domain.enums.ChainType;
import com.nexo.business.blockchain.service.impl.base.AbstractChainService;
import org.springframework.stereotype.Service;

/**
 * @classname WenChangChainServiceImpl
 * @description 文昌 区块链服务实现类
 * @date 2025/12/25 16:39
 */
@Service("wenChangChainService")
public class WenChangChainServiceImpl extends AbstractChainService {

    @Override
    public ChainType supportType() {
        return ChainType.WEN_CHANG;
    }
}
