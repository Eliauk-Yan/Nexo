package com.nexo.business.chain.service.impl;

import com.alibaba.fastjson2.JSON;
import com.baidu.xasset.auth.XchainAccount;
import com.baidu.xuper.api.Account;
import com.nexo.business.chain.api.request.ChainProviderRequest;
import com.nexo.business.chain.api.response.ChainProviderResponse;
import com.nexo.business.chain.config.BaiduSuperChainProperties;
import com.nexo.business.chain.domain.enums.ChainOperateType;
import com.nexo.business.chain.domain.enums.ChainOperationBizType;
import com.nexo.business.chain.domain.enums.ChainOperationState;
import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.service.ChainOperationLogService;
import com.nexo.business.chain.service.impl.base.AbstractChainService;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import org.springframework.stereotype.Service;

/**
 * @classname BaiduSuperChainServiceImpl
 * @description 百度超级链
 * @date 2026/01/05 16:41
 */
@Service("baiduSuperChainService")
public class BaiduSuperChainServiceImpl extends AbstractChainService {

    private final BaiduSuperChainProperties properties;

    public BaiduSuperChainServiceImpl(ChainOperationLogService chainOperationLogService, BaiduSuperChainProperties properties) {
        super(chainOperationLogService);
        this.properties = properties;
    }

    @Override
    public ChainType getChainType() {
        return ChainType.BAIDU_SUPER;
    }

    @Override
    public ChainResponse<ChainCreateData> createChainAccount(ChainRequest request) {
        // 1. 设置操作业务 ID
        request.setBizId(request.getUserId());
        // 2. 插入链操作日志
        Long chainOperationLogId = chainOperationLogService.insertLog(getChainType(), request.getBizId(), ChainOperationBizType.USER, ChainOperateType.CREATE_ACCOUNT, JSON.toJSONString(request), request.getIdentifier());
        // 3. 创建区块链账户
        Account acc = XchainAccount.newXchainEcdsaAccount(XchainAccount.mnemStrgthStrong, XchainAccount.mnemLangEN);
        // 4. 更新链操作日志
        chainOperationLogService.updateLog(chainOperationLogId, ChainOperationState.SUCCESS, acc.toString());
        // 5. 构造返回结果
        ChainResponse<ChainCreateData> response = new ChainResponse<>();
        response.setSuccess(true);
        response.setCode(ChainOperationState.SUCCESS.getCode());
        response.setMessage(ChainOperationState.SUCCESS.getDesc());
        response.setData(new ChainCreateData(request.getIdentifier(), acc.getAddress(), request.getUserId(), getChainType().getCode()));
        return response;
    }

    @Override
    protected ChainProviderResponse doPost(ChainProviderRequest request) {
       return null;
    }
}
