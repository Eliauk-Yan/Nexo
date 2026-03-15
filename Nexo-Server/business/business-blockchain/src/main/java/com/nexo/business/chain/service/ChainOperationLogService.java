package com.nexo.business.chain.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.chain.domain.entity.ChainOperationStream;
import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.constant.ChainOperationState;
import com.nexo.common.api.blockchain.constant.ChainType;

public interface ChainOperationLogService extends IService<ChainOperationStream> {

    /**
     * 查询操作日志
     */
    ChainOperationStream queryLog(String bizId, ChainOperationBizType bizType, String identifier);

    /**
     * 插入操作日志
     */
    Long insertLog(ChainType chainType, String bizId, ChainOperationBizType bizType, ChainOperateType operateType, String param, String operationId);

    /**
     * 更新操作日志
     */
    boolean updateLog(Long chainOperationLogId, ChainOperationState state, String result);
}
