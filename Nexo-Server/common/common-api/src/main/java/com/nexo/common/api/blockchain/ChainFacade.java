package com.nexo.common.api.blockchain;


import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;

public interface ChainFacade {

    /**
     * 创建区块链账户
     * @param request 请求参数
     * @return 响应参数
     */
    ChainResponse<ChainCreateData> createChainAccount(ChainRequest request);

    /**
     * 上传链操作
     * @param request 请求参数
     * @return 响应参数
     */
    ChainResponse<ChainOperationData> onChain(ChainRequest request);

    /**
     * 铸造藏品
     * @param request 请求参数
     * @return 响应参数
     */
    ChainResponse<ChainOperationData> mint(ChainRequest request);

    /**
     *交易藏品
     * @param request 请求参数
     * @return 响应参数
     */
    ChainResponse<ChainOperationData> transfer(ChainRequest request);

    /**
     * 销毁藏品
     * @param request 请求参数
     * @return 响应参数
     */
    ChainResponse<ChainOperationData> burn(ChainRequest request);

}
