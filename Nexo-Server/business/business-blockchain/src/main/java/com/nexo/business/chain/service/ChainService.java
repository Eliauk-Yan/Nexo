package com.nexo.business.chain.service;

import com.nexo.business.chain.domain.entity.ChainOperationLog;
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
     * @return 链类型
     */
    ChainType getChainType();

    /**
     * 创建链账户
      * @param request 创建链账户请求
     * @return 创建链账户响应
     */
    ChainResponse<ChainCreateData> createChainAccount(ChainRequest request);

    /**
     * 上链藏品
     * @param request 藏品上链请求
      * @return 藏品上链响应
     */
    ChainResponse<ChainOperationData> onChain(ChainRequest request);

    /**
     * 铸造藏品
     * @param request 藏品铸造请求
      * @return 藏品铸造响应
     */
    ChainResponse<ChainOperationData> mint(ChainRequest request);

    /**
     * 交易藏品
      * @param request 藏品交易请求
      * @return 藏品交易响应
     */
    ChainResponse<ChainOperationData> transfer(ChainRequest request);

    /**
     * 销毁藏品
      * @param request 藏品销毁请求
      * @return 藏品销毁响应
     */
    ChainResponse<ChainOperationData> destroy(ChainRequest request);

    /**
     * 查询上链交易结果
     * @param request 查询上链交易结果请求
     * @return 查询上链交易结果响应
     */
    ChainResponse<ChainResultData> queryChainResult(ChainQueryRequest request);

    /**
     * 发送消息
      * @param operateInfo 操作信息
      * @param data 数据
     */
    void sendMsg(ChainOperationLog operateInfo, ChainResultData data);
}
