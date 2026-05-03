package com.nexo.business.chain.service;

import com.nexo.business.chain.domain.entity.ChainOperationStream;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.api.blockchain.response.data.ChainResultData;

public interface ChainService {

    /**
     * 创建链账户
     */
    ChainResponse createChainAccount(ChainRequest request);

    /**
     * 上链藏品
     */
    ChainResponse onChain(ChainRequest request);

    /**
     * 铸造藏品
     */
    ChainResponse<ChainOperationData> mint(ChainRequest request);

    /**
     * 交易藏品
     */
    ChainResponse<ChainOperationData> transfer(ChainRequest request);

    /**
     * 发送消息
     */
    void sendMsg(ChainOperationStream operateStream, ChainResultData resultData);
}
