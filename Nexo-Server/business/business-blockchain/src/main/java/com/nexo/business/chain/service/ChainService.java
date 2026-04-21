package com.nexo.business.chain.service;

import com.nexo.business.chain.domain.entity.ChainOperationStream;
import com.nexo.common.api.blockchain.constant.ChainType;
import com.nexo.common.api.blockchain.request.ChainQueryRequest;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.api.blockchain.response.data.ChainResultData;

public interface ChainService {

    /**
     * 获取链类型
     */
    ChainType getChainType();

    /**
     * 创建链账户
     */
    ChainResponse<ChainCreateData> createChainAccount(ChainRequest request);

    /**
     * 上链藏品
     */
    ChainResponse<ChainOperationData> onChain(ChainRequest request);

    /**
     * 铸造藏品
     */
    ChainResponse<ChainOperationData> mint(ChainRequest request);

    /**
     * 交易藏品
     */
    ChainResponse<ChainOperationData> transfer(ChainRequest request);

    /**
     * 销毁藏品
     */
    ChainResponse<ChainOperationData> destroy(ChainRequest request);

    /**
     * 查询上链交易结果
     */
    ChainResponse<ChainResultData> queryChainResult(ChainQueryRequest request);

    /**
     * 发送消息
     */
    void sendMsg(ChainOperationStream operateInfo, ChainResultData data);
}
