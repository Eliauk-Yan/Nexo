package com.nexo.business.chain.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.chain.domain.entity.ChainOperationLog;
import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.constant.ChainOperationState;
import com.nexo.common.api.blockchain.constant.ChainType;

public interface ChainOperationLogService extends IService<ChainOperationLog> {

    /**
     * 查询操作日志
     * @param bizId 业务 ID
     * @param bizType 业务类型
     * @param identifier 幂等号
     * @return 操作日志
     */
    ChainOperationLog queryLog(String bizId, ChainOperationBizType bizType, String identifier);

    /**
     * 插入操作日志
     * @param chainType 链类型
     * @param bizId 业务 ID
     * @param bizType 业务类型
     * @param operateType 操作类型
     * @param param 参数
     * @param operationId 操作 ID
     * @return 操作 ID
     */
    Long insertLog(ChainType chainType, String bizId, ChainOperationBizType bizType, ChainOperateType operateType, String param, String operationId);

    /**
     * 更新操作日志
     * @param chainOperationLogId 操作日志 ID
     * @param state 操作状态
     * @param result 操作结果
     */
    boolean updateLog(Long chainOperationLogId, ChainOperationState state, String result);
}
