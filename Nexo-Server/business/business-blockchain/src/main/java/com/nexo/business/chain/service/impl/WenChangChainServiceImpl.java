package com.nexo.business.chain.service.impl;

import com.google.common.collect.Maps;
import com.nexo.business.chain.config.WenChangChainConfiguration;
import com.nexo.business.chain.domain.enums.ChainOperationBizType;
import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.service.ChainOperationLogService;
import com.nexo.business.chain.service.impl.base.AbstractChainService;
import com.nexo.business.chain.utils.WenChangChainUtil;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.base.constant.CommonConstant;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * @classname WenChangChainServiceImpl
 * @description 文昌 区块链服务实现类
 * @date 2025/12/25 16:39
 */
@Service("wenChangChainService")
public class WenChangChainServiceImpl extends AbstractChainService {

    private final WenChangChainConfiguration wenChangChainConfiguration;

    public WenChangChainServiceImpl(ChainOperationLogService chainOperationLogService, WenChangChainConfiguration wenChangChainConfiguration) {
        super(chainOperationLogService);
        this.wenChangChainConfiguration = wenChangChainConfiguration;
    }

    @Override
    public ChainType getChainType() {
        return ChainType.WEN_CHANG;
    }

    @Override
    public ChainResponse<ChainCreateData> createChainAccount(ChainRequest request) {
        request.setBizId(request.getUserId());
        // 构建 Query 参数
        String path = "/v3/account";
        Map<String, Object> query = Maps.newHashMapWithExpectedSize(1);
        query.put("path_url", path);
        // 构建 Body 参数
        HashMap<@Nullable String, @Nullable Object> body = Maps.newHashMapWithExpectedSize(2);
        body.put("name", CommonConstant.APP_NAME + CommonConstant.SEPARATOR + ChainOperationBizType.USER.getCode() + CommonConstant.SEPARATOR + request.getUserId());
        body.put("operation_id", request.getIdentifier());
        long currentTime = System.currentTimeMillis();
        // 对请求参数进行签名处理
        String signature = WenChangChainUtil.signRequest(path, query, body, currentTime, wenChangChainConfiguration.getApiSecret());
        // ChainResponse response = doPostExecute(request, ChainOperateType.CREATE_ACCOUNT, );

        return null;
    }
}
