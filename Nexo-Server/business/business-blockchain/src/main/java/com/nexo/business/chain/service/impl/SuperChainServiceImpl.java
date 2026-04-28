package com.nexo.business.chain.service.impl;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.nexo.business.chain.domain.entity.ChainOperationStream;
import com.nexo.business.chain.service.ChainOperationLogService;
import com.nexo.business.chain.service.ChainService;
import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.constant.ChainOperationState;
import com.nexo.common.api.blockchain.constant.ChainType;
import com.nexo.common.api.blockchain.model.ChainOperateBody;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.api.blockchain.response.data.ChainResultData;
import com.nexo.common.base.response.ResponseCode;
import com.nexo.common.mq.producer.StreamProducer;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 百度超级链数字藏品服务。
 */
@Service("superChainService")
@RequiredArgsConstructor
public class SuperChainServiceImpl implements ChainService {

    private static final int SUCCESS_CODE = 200;

    @Value("${nexo.chain.super.host}")
    private String host;

    @Value("${nexo.chain.super.app-code}")
    private String appCode;

    @Value("${nexo.chain.super.admin-pwd}")
    private String adminPwd;

    @Value("${nexo.chain.super.admin-owner}")
    private String adminOwner;

    private final ChainOperationLogService chainOperationLogService;

    private final StreamProducer streamProducer;

    @Override
    public ChainResponse createChainAccount(ChainRequest request) {
        // 1. 幂等控制
        request.setBizType(ChainOperationBizType.USER);
        request.setBizId(request.getUserId());
        ChainOperationStream stream = chainOperationLogService.queryLog(request.getBizId(), request.getBizType(), request.getIdentifier());
        if (stream != null) {
            JSONObject result = JSON.parseObject(stream.getResult());
            JSONObject data = result.getJSONObject("data");
            String userId = data.getString("userId");
            String txid = data.getString("txid");
            ChainResponse response = new ChainResponse();
            response.setUserId(userId);
            response.setTxHash(txid);
            response.setIdentifier(stream.getIdentifier());
            response.setOutBizId(stream.getOutBizId());
            response.setPlatform(stream.getChainType().getCode());
            response.setSuccess(true);
            response.setCode(String.valueOf(result.getIntValue("code")));
            response.setMessage(result.getString("msg"));
            return response;
        }
        // 2. 构造请求参数
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("userId", request.getUserId());
        body.put("pwd", request.getPwd());
        // 3. 插入流水
        Long streamId = chainOperationLogService.insertLog(ChainType.SUPER, request.getBizId(), request.getBizType(), ChainOperateType.CREATE_ACCOUNT, JSON.toJSONString(body), request.getIdentifier());
        // 4. 发起请求
        JSONObject result = doPost("/digital-assets/user/register", body);
        // 5. 更新流水
        ChainOperationState state = result.getIntValue("code") == 200 ? ChainOperationState.SUCCESS : ChainOperationState.FAILED;
        chainOperationLogService.updateLog(streamId, state, result.toJSONString(), result.getString("taskNo"));
        // 6. 解析响应
        ChainResultData data = result.getObject("data", ChainResultData.class);
        ChainResponse response = new ChainResponse();
        response.setUserId(data.getUserId());
        response.setTxHash(data.getTxid());
        response.setIdentifier(stream.getIdentifier());
        response.setOutBizId(stream.getOutBizId());
        response.setPlatform(stream.getChainType().getCode());
        response.setSuccess(true);
        response.setCode(String.valueOf(result.getIntValue("code")));
        response.setMessage(result.getString("msg"));
        return response;
    }

    @Override
    public ChainResponse onChain(ChainRequest request) {
        // 1. 幂等控制
        request.setBizType(ChainOperationBizType.NFT);
        ChainOperationStream stream = chainOperationLogService.queryLog(request.getBizId(), request.getBizType(), request.getIdentifier());
        if (stream != null) {
            return ChainResponse.success(stream.getIdentifier());
        }
        // 2. 构造请求参数
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", request.getClassName());
        body.put("creator", request.getCreator());
        body.put("owner", request);
        body.put("category", request.getCategory());
        body.put("description", request.getDescription());
        body.put("maxSupply", request.getMaxSupply());
        // 3. 插入流水
        Long streamId = chainOperationLogService.insertLog(ChainType.SUPER, request.getBizId(), request.getBizType(), ChainOperateType.NFT_ON_CHAIN, JSON.toJSONString(body), request.getIdentifier());
        // 4. 发起请求
        JSONObject result = doPost("/digital-assets/assets/deploy", body);
        ChainResultData data = result.getObject("data", ChainResultData.class);
        // 6. 更新流水
        ChainOperationState state = result.getIntValue("code") == 200 ? ChainOperationState.SUCCESS : ChainOperationState.FAILED;
        ChainOperationStream newStream = chainOperationLogService.updateLog(streamId, state, result.toJSONString(), result.getString("taskNo"));
        // TODO 资产URI设置
        // 7. 发送MQ消息
        if (state == ChainOperationState.SUCCESS) {
            sendMsg(newStream, data);
        }
        return ChainResponse.success(request.getIdentifier());
    }

    @Override
    public ChainResponse<ChainOperationData> mint(ChainRequest request) {
        // 1. 幂等控制
        request.setBizType(ChainOperationBizType.NFT);
        ChainOperationStream stream = chainOperationLogService.queryLog(request.getBizId(), request.getBizType(), request.getIdentifier());
        if (stream != null) {
            return ChainResponse.success(stream.getIdentifier());
        }
        // 2. 构造请求参数
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("assetId", request.getClassId());
        body.put("pwd", adminOwner);
        body.put("to", request.getTo());
        // 3. 插入操作流水
        Long streamId = chainOperationLogService.insertLog(ChainType.SUPER, request.getBizId(), request.getBizType(), ChainOperateType.NFT_MINT, JSON.toJSONString(body), request.getIdentifier());
        // 4. 发送请求
        JSONObject result = doPost("/digital-assets/assets/mint", body);



        return executeOperation(request, ChainOperateType.NFT_MINT, "/digital-assets/token/mint", body, (data, source) -> {
            data.setAssetId(getString(source, "tokenId", request.getNtfId()));
            data.setTxid(getString(source, "txid", null));
        });
    }

    @Override
    public ChainResponse<ChainOperationData> transfer(ChainRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("tokenId", firstNotBlank(request.getNtfId(), request.getClassId()));
        body.put("from", request.getOwner());
        body.put("pwd", resolvePwd(request));
        body.put("to", request.getTo());

        return executeOperation(request, ChainOperateType.NFT_TRANSFER, "/digital-assets/token/transfer", body, (data, source) -> {
            data.setAssetId(body.get("tokenId").toString());
            data.setTxid(getString(source, "txid", null));
        });
    }

    @Override
    public ChainResponse<ChainOperationData> destroy(ChainRequest request) {
        ChainResponse<ChainOperationData> response = new ChainResponse<>();
        response.setSuccess(false);
        response.setCode(ResponseCode.ILLEGAL_ARGUMENT.getCode());
        response.setMessage("当前第三方超级链接口未提供凭证销毁能力");
        return response;
    }



    private ChainResponse<ChainOperationData> executeOperation(ChainRequest request, ChainOperateType operateType,
                                                               String path, Map<String, Object> body,
                                                               ChainResultDataFiller filler) {
        ChainOperationStream existLog = chainOperationLogService.queryLog(request.getBizId(), request.getBizType(), request.getIdentifier());
        if (existLog != null) {
            return ChainResponse.success(new ChainOperationData(request.getIdentifier()));
        }

        ChainResultData resultData = new ChainResultData();
        JSONObject result = executeWithLog(request, operateType, path, body, resultData);
        if (!isSuccess(result)) {
            return failedOperationResponse(result);
        }
        filler.fill(resultData, result.getJSONObject("data"));

        ChainOperationStream operateInfo = chainOperationLogService.queryLog(request.getBizId(), request.getBizType(), request.getIdentifier());
        if (operateInfo != null) {
            sendMsg(operateInfo,  resultData);
        }
        return ChainResponse.success(new ChainOperationData(request.getIdentifier()));
    }

    private JSONObject executeWithLog(ChainRequest request, ChainOperateType operateType, String path,
                                      Map<String, Object> body, ChainResultData resultData) {
        Long logId = chainOperationLogService.insertLog(ChainType.SUPER, request.getBizId(), request.getBizType(),
                operateType, JSON.toJSONString(body), request.getIdentifier());
        JSONObject result = doPost(path, body);
        ChainOperationState state = isSuccess(result) ? ChainOperationState.SUCCESS : ChainOperationState.FAILED;
//        if (resultData != null) {
//            resultData.setState(state.getCode());
//        }
        chainOperationLogService.updateLog(logId, state, result.toJSONString(), result.getString("taskNo"));
        return result;
    }

    /**
     * post 发送请求
     * @param path 路径
     * @param body 请求体
     * @return 响应对象
     */
    private JSONObject doPost(String path, Map<String, Object> body) {
        HttpRequest request = HttpRequest.post(host + path)
                .header("Authorization", "APPCODE " + appCode)
                .header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
                .form(body);
        try (HttpResponse response = request.execute()) {
            return JSON.parseObject(response.body());
        } catch (Exception e) {
            JSONObject result = new JSONObject();
            result.put("code", ResponseCode.SYSTEM_ERROR.getCode());
            result.put("msg", e.getMessage());
            result.put("data", new JSONObject());
            return result;
        }
    }

    /**
     * 发送MQ消息
     */
    @Override
    public void sendMsg(ChainOperationStream operateStream, ChainResultData resultData) {
        ChainOperateBody chainOperateBody = new ChainOperateBody();
        chainOperateBody.setChainType(operateStream.getChainType());
        chainOperateBody.setOperateType(operateStream.getOperationType());
        chainOperateBody.setStreamId(operateStream.getId());
        chainOperateBody.setBizId(operateStream.getBizId());
        chainOperateBody.setBizType(operateStream.getBizType());
        chainOperateBody.setChainResultData(resultData);
        streamProducer.send("chain-out-0", operateStream.getBizType().getCode(), JSON.toJSONString(chainOperateBody));
    }

    private ChainResponse<ChainOperationData> failedOperationResponse(JSONObject result) {
        ChainResponse<ChainOperationData> response = new ChainResponse<>();
        response.setSuccess(false);
        response.setCode(result.getString("code"));
        response.setMessage(result.getString("msg"));
        return response;
    }

    private boolean isSuccess(JSONObject result) {
        return result != null && result.getIntValue("code") == SUCCESS_CODE;
    }

    private String resolvePwd(ChainRequest request) {
        return firstNotBlank(request.getPwd(), adminPwd);
    }

    private String resolveOwner(ChainRequest request) {
        return firstNotBlank(request.getOwner(), request.getTo(), adminOwner);
    }

    private String firstNotBlank(String... values) {
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private String getString(JSONObject data, String key, String defaultValue) {
        if (data == null || StringUtils.isBlank(data.getString(key))) {
            return defaultValue;
        }
        return data.getString(key);
    }

    @FunctionalInterface
    private interface ChainResultDataFiller {
        void fill(ChainResultData data, JSONObject source);
    }
}
