package com.nexo.business.chain.service.impl;

import cn.hutool.core.lang.UUID;
import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.service.impl.base.AbstractChainService;
import com.nexo.common.api.base.response.ResponseCode;
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

    @Override
    public ChainType supportType() {
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
}
