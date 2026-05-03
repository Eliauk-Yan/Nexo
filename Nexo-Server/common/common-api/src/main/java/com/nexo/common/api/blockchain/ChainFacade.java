package com.nexo.common.api.blockchain;


import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;


public interface ChainFacade {

    /**
     * 创建区块链账户
     */
    ChainResponse createChainAccount(ChainRequest request);

    /**
     * 藏品链操作
     */
    ChainResponse onChain(ChainRequest request);

    /**
     * 铸造藏品
     */
    ChainResponse mint(ChainRequest request);

    /**
     * 资产转赠
     */
    ChainResponse transfer(ChainRequest request);

}
