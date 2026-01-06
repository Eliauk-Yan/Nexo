package com.nexo.business.chain.service.impl.base;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.nexo.business.chain.api.request.ChainProviderRequest;
import com.nexo.business.chain.api.response.ChainProviderResponse;
import com.nexo.business.chain.domain.entity.ChainOperationLog;
import com.nexo.business.chain.domain.enums.ChainOperateType;
import com.nexo.business.chain.domain.enums.ChainOperationBizType;
import com.nexo.business.chain.domain.enums.ChainOperationState;
import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.domain.exception.ChainErrorCode;
import com.nexo.business.chain.domain.exception.ChainException;
import com.nexo.business.chain.service.ChainOperationLogService;
import com.nexo.business.chain.service.ChainService;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.limiter.annotation.RateLimit;
import lombok.RequiredArgsConstructor;

import java.util.concurrent.*;
import java.util.function.Consumer;

/**
 * @classname AbstractChainService
 * @description 链服务抽象类
 * @date 2025/12/25 16:43
 */
@RequiredArgsConstructor
public abstract class AbstractChainService implements ChainService {

    protected final ChainOperationLogService chainOperationLogService;

    // 线程工厂
    private static final ThreadFactory blockchainResultProcessFactory = new ThreadFactoryBuilder().setNameFormat("blockchain-process-pool-%d").build();
    // 调度线程池
    ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(10, blockchainResultProcessFactory);

    public abstract ChainType getChainType();

    @RateLimit(key = "#type + ':' + #request.identifier", limit = 1, windowSize = 60, message = "链操作过于频繁，60秒后再试")
    protected ChainResponse<?> doPostExecute(ChainRequest request, ChainOperationBizType bizType, ChainOperateType operationType, Consumer<ChainProviderRequest> consumer)  {
        // 1. 做幂等控制，防止重复上链
        ChainOperationLog chainOperationLog = chainOperationLogService.queryLog(request.getBizId(), bizType, request.getIdentifier());
        if (chainOperationLog != null) {
            // 1.1 多余请求，做幂等控制
            // 创建链账户操作
            if (operationType == ChainOperateType.CREATE_ACCOUNT) {
                // 创建兜底响应
                ChainResponse<ChainCreateData> response = new ChainResponse<>();
                // 填充响应数据
                response.setSuccess(true);
                response.setCode(ChainOperationState.SUCCESS.getCode());
                JSONObject jsonObject = JSON.parseObject(chainOperationLog.getResult(), JSONObject.class);
                String account = jsonObject.getString("native_address");
                ChainCreateData data = new ChainCreateData(request.getIdentifier(), account, request.getUserId(), getChainType().name());
                response.setData(data);
                return response;
            } else {
                // 其他操作
                ChainResponse<ChainOperationData> response = new ChainResponse<>();
                response.setSuccess(true);
                response.setCode(ChainOperationState.PROCESSING.getCode());
                response.setData(new ChainOperationData(request.getIdentifier()));
                return response;
            }
        }
        // 2. 插入链操作日志
        Long chainOperationLogId = chainOperationLogService.insertLog(getChainType(), request.getBizId(), bizType, operationType, JSON.toJSONString(request), request.getIdentifier());
        // 3. 构建外部服务调用请求体
        ChainProviderRequest chainProviderRequest = new ChainProviderRequest();
        // 3.1 填充请求参数
        consumer.accept(chainProviderRequest);
        // 4. 发送请求
        ChainProviderResponse result = doPost(chainProviderRequest);
        // 5. 更新链操作日志
        boolean isUpdate = chainOperationLogService.updateLog(chainOperationLogId, null, result.getData() == null ? result.getError().toString() : result.getData().toString());
        if (!isUpdate) {
            throw new ChainException(ChainErrorCode.LOG_UPDATE_FAILED);
        }
        // 6. 构造返回结果
        ChainResponse<Object> response = new ChainResponse<>();
        // 6.1 如果请求失败
        if (result.getData() == null) {
            response.setSuccess(false);
            response.setCode(result.getError().getString("code"));
            response.setMessage(result.getError().getString("message"));
            response.setSuccess(false);
        } else {
            // 6.2 请求成功
            // 6.2.1 创建链账户
            if (operationType == ChainOperateType.CREATE_ACCOUNT) {
                // 原生地址格式
                String nativeAddress = result.getData().getString("native_address");
                String userId = request.getUserId();
                // 创建并填充数据
                ChainCreateData data = new ChainCreateData(request.getIdentifier(), nativeAddress, userId, getChainType().name());
                response.setData(data);
                response.setSuccess(true);
            } else {
                // 6.2.2 其他操作
                // 其他操作异步执行 先返回处理中
                response.setCode(ChainOperationState.PROCESSING.getCode());
                // 填充数据
                ChainOperationData data = new ChainOperationData(request.getIdentifier());
                response.setSuccess(true);
                response.setData(data);
            }
        }

        // 7. 其他操作异步执行
        if (response.getSuccess() && operationType != ChainOperateType.CREATE_ACCOUNT) {
            scheduler.schedule(() -> {
                // TODO 异步处理

            }, 5, TimeUnit.SECONDS);
        }
        // 8. 返回结果
        return response;
    }

    protected abstract ChainProviderResponse doPost(ChainProviderRequest request);

}
