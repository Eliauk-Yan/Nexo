package com.nexo.business.chain.interfaces.facade;

import com.nexo.business.chain.service.ChainService;
import com.nexo.business.chain.service.factory.ChainServiceFactory;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * @classname BlockchainFacadeImpl
 * @description 
 * @date 2025/12/25 11:21
 */
@RequiredArgsConstructor
@DubboService(version = "1.0.0")
public class ChainFacadeImpl implements ChainFacade {

    private final ChainServiceFactory chainServiceFactory;

    @Override
    public ChainResponse<ChainCreateData> createChainAccount(ChainRequest request) {
        return null;
    }

    @Override
    public ChainResponse<ChainOperationData> onChain(ChainRequest request) {
        return null;
    }

    @Override
    public ChainResponse<ChainOperationData> mint(ChainRequest request) {
        return null;
    }

    @Override
    public ChainResponse<ChainOperationData> transfer(ChainRequest request) {
        return null;
    }

    @Override
    public ChainResponse<ChainOperationData> burn(ChainRequest request) {
        return null;
    }
}
