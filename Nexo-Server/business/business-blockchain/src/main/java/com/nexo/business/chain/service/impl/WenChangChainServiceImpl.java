package com.nexo.business.chain.service.impl;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import com.alibaba.fastjson2.JSON;
import com.google.common.collect.Maps;
import com.nexo.business.chain.api.request.ChainProviderRequest;
import com.nexo.business.chain.api.request.WeChangCreateChainBody;
import com.nexo.business.chain.api.response.ChainProviderResponse;
import com.nexo.business.chain.config.WenChangChainProperties;
import com.nexo.business.chain.domain.enums.ChainOperateType;
import com.nexo.business.chain.domain.enums.ChainOperationBizType;
import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.service.ChainOperationLogService;
import com.nexo.business.chain.service.impl.base.AbstractChainService;
import com.nexo.business.chain.utils.WenChangChainUtil;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.base.constant.CommonConstant;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;


/**
 * @classname WenChangChainServiceImpl
 * @description 文昌 区块链服务实现类
 * @date 2025/12/25 16:39
 */
@Slf4j
@Service("wenChangChainService")
public class WenChangChainServiceImpl extends AbstractChainService {

    private final WenChangChainProperties wenChangChainProperties;

    public WenChangChainServiceImpl(ChainOperationLogService chainOperationLogService, WenChangChainProperties wenChangChainProperties) {
        super(chainOperationLogService);
        this.wenChangChainProperties = wenChangChainProperties;
    }

    @Override
    public ChainType getChainType() {
        return ChainType.WEN_CHANG;
    }


    @Override
    public ChainResponse<ChainCreateData> createChainAccount(ChainRequest request) {
        // 1. 设置操作业务 ID
        request.setBizId(request.getUserId());
        // 2. 构建 Query 参数
        String path = "/v3/account";
        Map<String, Object> query = Maps.newHashMapWithExpectedSize(1);
        query.put("path_url", path);
        // 3. 构建 Body 参数
        HashMap<@Nullable String, @Nullable Object> body = Maps.newHashMapWithExpectedSize(2);
        String name = CommonConstant.APP_NAME + CommonConstant.SEPARATOR + ChainOperationBizType.USER.getCode() + CommonConstant.SEPARATOR + request.getUserId();
        body.put("name", name);
        body.put("operation_id", request.getIdentifier());
        long currentTime = System.currentTimeMillis();
        // 4. 签名
        String signature = WenChangChainUtil.signRequest(path, query, body, currentTime, wenChangChainProperties.getApiSecret());
        // 5. 发送请求
        doPostExecute(request, ChainOperationBizType.USER, ChainOperateType.CREATE_ACCOUNT, chainProviderRequest -> {
            // 构造请求
            chainProviderRequest.setSignature(signature);
            chainProviderRequest.setPath(path);
            chainProviderRequest.setHost(wenChangChainProperties.getHost());
            chainProviderRequest.setCurrentTime(currentTime);
            chainProviderRequest.setBody(new WeChangCreateChainBody(request.getIdentifier(), name));
        });

        return null;
    }

    @Override
    protected ChainProviderResponse doPost(ChainProviderRequest request) {
        // 1. 构造HTTP请求
        HttpRequest post = HttpRequest.post(request.getHost() + request.getPath());
        // 2. 添加请求头
        post.addHeaders(WenChangChainUtil.configureHeaders(request.getSignature(), request.getCurrentTime(), wenChangChainProperties.getApiKey()));
        // 3. 添加请求体
        post.body(JSON.toJSONString(request.getBody()));
        // 4. 发送请求
        // Java 7 语法糖 try-with-resources 用完自动关闭 response.close
        try (HttpResponse response = post.execute()) {
            String responseJson = response.body();
            // 5. 解析结果并返回
            return JSON.parseObject(responseJson, ChainProviderResponse.class);
        }
    }

}
