package com.nexo.business.chain.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.chain.domain.entity.ChainOperationLog;
import com.nexo.business.chain.domain.enums.ChainOperateType;
import com.nexo.business.chain.domain.enums.ChainOperationBizType;
import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.business.chain.mapper.mybatis.ChainOperationLogMapper;
import com.nexo.business.chain.service.ChainOperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * @classname ChainOperationLogServiceImpl
 * @description 链操作日志服务实现
 * @date 2026/01/03 21:52
 */
@Service
@RequiredArgsConstructor
public class ChainOperationLogServiceImpl extends ServiceImpl<ChainOperationLogMapper, ChainOperationLog> implements ChainOperationLogService {

    @Override
    public ChainOperationLog findLog(String bizId, ChainOperationBizType bizType, String identifier) {
        LambdaQueryWrapper<ChainOperationLog> wrapper = new LambdaQueryWrapper<ChainOperationLog>()
                .eq(ChainOperationLog::getBizId, bizId)
                .eq(ChainOperationLog::getBizType, bizType)
                .eq(ChainOperationLog::getOutBizId, identifier);
        return this.getOne(wrapper);
    }

    @Override
    public Long insertLog(ChainType chainType, String bizId, ChainOperationBizType bizType, ChainOperateType operateType, String param, String operationId) {
        ChainOperationLog chainOperationLog = new ChainOperationLog();
        chainOperationLog.setBizId(bizId);
        chainOperationLog.setBizType(bizType);
        chainOperationLog.setChainType(chainType);
        chainOperationLog.setOperationType(operateType);
        chainOperationLog.setParam(param);
        chainOperationLog.setOutBizId(operationId);
        boolean res = this.save(chainOperationLog);
        if (res) {
            return chainOperationLog.getId();
        }
        return null;
    }
}
