package com.nexo.business.chain.service.impl.base;

import com.alibaba.fastjson2.JSON;
import com.nexo.business.chain.domain.entity.ChainOperationLog;
import com.nexo.business.chain.domain.enums.ChainOperateType;
import com.nexo.business.chain.domain.enums.ChainOperationBizType;
import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.service.ChainOperationLogService;
import com.nexo.business.chain.service.ChainService;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.limiter.annotation.RateLimit;
import lombok.RequiredArgsConstructor;

import java.util.function.Consumer;

/**
 * @classname AbstractChainService
 * @description 链服务抽象类
 * @date 2025/12/25 16:43
 */
@RequiredArgsConstructor
public abstract class AbstractChainService implements ChainService {

    private final ChainOperationLogService chainOperationLogService;

    public abstract ChainType getChainType();

    @RateLimit(key = "#type + ':' + #request.identifier", limit = 1, windowSize = 60, message = "链操作过于频繁，60秒后再试")
    protected ChainResponse<?> doPostExecute(ChainRequest request, ChainOperationBizType bizType, ChainOperateType type, Consumer<ChainRequest> consumer)  {
        // 1. 查询有没有操作过
        ChainOperationLog chainOperationLog = chainOperationLogService.findLog(request.getBizId(), bizType, request.getIdentifier());
        if (chainOperationLog != null) {
            //
        }
        // 没有
        Long operationId = chainOperationLogService.insertLog(getChainType(), request.getBizId(), bizType, type, JSON.toJSONString(request), request.getIdentifier());
        return null;
    }

}
