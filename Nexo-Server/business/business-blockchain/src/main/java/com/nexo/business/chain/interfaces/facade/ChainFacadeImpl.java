package com.nexo.business.chain.interfaces.facade;

import com.nexo.business.chain.service.ChainService;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * @classname BlockchainFacadeImpl
 * @description 
 * @date 2025/12/25 11:21
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class ChainFacadeImpl implements ChainFacade {

    private final ChainService chainService;

    @Override
    public ChainResponse createChainAccount(ChainRequest request) {
        return chainService.createChainAccount(request);
    }

    @Override
    public ChainResponse onChain(ChainRequest request) {
        return chainService.onChain(request);
    }

    @Override
    public ChainResponse<ChainOperationData> mint(ChainRequest request) {
        return chainService.mint(request);
    }

    @Override
    public ChainResponse<ChainOperationData> transfer(ChainRequest request) {
        return chainService.transfer(request);
    }

    @Override
    public ChainResponse<ChainOperationData> destroy(ChainRequest request) {
        return chainService.destroy(request);
    }
}
