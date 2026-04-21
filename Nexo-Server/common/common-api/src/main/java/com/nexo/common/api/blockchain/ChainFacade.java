package com.nexo.common.api.blockchain;


import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;

public interface ChainFacade {

    /**
     * 创建区块链账户
     */
    ChainResponse<ChainCreateData> createChainAccount(ChainRequest request);

    /**
     * 铸造藏品
     */
    ChainResponse<ChainOperationData> mint(ChainRequest request);

    /**
     * 藏品链操作
     */
    ChainResponse<ChainOperationData> onChain(ChainRequest request);

    /**
     * 资产交易
     */
    ChainResponse<ChainOperationData> transfer(ChainRequest request);

    /**
     * 资产销毁
     */
    ChainResponse<ChainOperationData> destroy(ChainRequest request);

}
