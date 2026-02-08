package com.nexo.business.chain.service.impl;

import cn.hutool.core.lang.UUID;
import com.alibaba.fastjson2.JSONObject;
import com.nexo.business.chain.api.request.ChainProviderRequest;
import com.nexo.business.chain.api.response.ChainProviderResponse;
import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.service.ChainOperationLogService;
import com.nexo.business.chain.service.impl.base.AbstractChainService;
import com.nexo.common.api.common.response.ResponseCode;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import org.springframework.stereotype.Service;

/**
 * @classname MockChainServiceImpl
 * @description MOCK 区块链服务实现类
 * @date 2025/12/25 15:47
 */
@Service("mockChainService")
public class MockChainServiceImpl extends AbstractChainService {

    public MockChainServiceImpl(ChainOperationLogService chainOperationLogService) {
        super(chainOperationLogService);
    }

    @Override
    public ChainType getChainType() {
        return ChainType.MOCK;
    }

    @Override
    public ChainResponse<ChainCreateData> createChainAccount(ChainRequest request) {
        // 1.构造返回数据
        ChainCreateData data = new ChainCreateData(request.getIdentifier(), UUID.randomUUID().toString(), "MockBlockChain", ChainType.MOCK.name());
        // 2. 构造响应数据
        ChainResponse<ChainCreateData> response = new ChainResponse<>();
        response.setSuccess(true);
        response.setCode(String.valueOf(ResponseCode.SUCCESS.getCode()));
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        response.setData(data);
        // 3. 返回响应
        return response;
    }

    @Override
    protected ChainProviderResponse doPost(ChainProviderRequest request) {
        // 1. 构造MOCK响应
        ChainProviderResponse response = new ChainProviderResponse();
        // 2. 填充MOCK返回数据
        JSONObject data = new JSONObject();
        data.put("success",true);
        data.put("chainType","mock");
        response.setData(data);
        // 3. 返回MOCK响应
        return response;
    }

}
