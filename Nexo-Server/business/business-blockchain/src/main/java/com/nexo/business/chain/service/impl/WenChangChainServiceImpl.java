package com.nexo.business.chain.service.impl;

import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.service.impl.base.AbstractChainService;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
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

    @Override
    public ChainResponse<ChainCreateData> createChainAccount(ChainRequest request) {
        return null;
    }
}
