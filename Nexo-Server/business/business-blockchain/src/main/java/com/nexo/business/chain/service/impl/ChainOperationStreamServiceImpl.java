package com.nexo.business.chain.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.chain.domain.entity.ChainOperationStream;
import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.constant.ChainOperationState;
import com.nexo.common.api.blockchain.constant.ChainType;
import com.nexo.business.chain.mapper.mybatis.ChainOperationStreamMapper;
import com.nexo.business.chain.service.ChainOperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * @classname ChainOperationLogServiceImpl
 * @description 链操作日志服务实现
 * @date 2026/01/03 21:52
 */
@Service
@RequiredArgsConstructor
public class ChainOperationStreamServiceImpl extends ServiceImpl<ChainOperationStreamMapper, ChainOperationStream> implements ChainOperationLogService {

    @Override
    public ChainOperationStream queryLog(String bizId, ChainOperationBizType bizType, String identifier) {
        LambdaQueryWrapper<ChainOperationStream> wrapper = new LambdaQueryWrapper<ChainOperationStream>()
                .eq(ChainOperationStream::getBizId, bizId)
                .eq(ChainOperationStream::getBizType, bizType)
                .eq(ChainOperationStream::getOutBizId, identifier);
        return this.getOne(wrapper);
    }

    @Override
    public Long insertLog(ChainType chainType, String bizId, ChainOperationBizType bizType, ChainOperateType operateType, String param, String operationId) {
        ChainOperationStream chainOperationStream = new ChainOperationStream();
        chainOperationStream.setBizId(bizId);
        chainOperationStream.setBizType(bizType);
        chainOperationStream.setChainType(chainType);
        chainOperationStream.setOperationType(operateType);
        chainOperationStream.setParam(param);
        chainOperationStream.setOutBizId(operationId);
        // 设置当前时间
        chainOperationStream.setOperateTime(LocalDateTime.now());
        // 设置状态为处理中
        chainOperationStream.setState(ChainOperationState.PROCESSING);
        boolean res = this.save(chainOperationStream);
        if (res) {
            return chainOperationStream.getId();
        }
        return null;
    }

    @Override
    public boolean updateLog(Long chainOperationLogId, ChainOperationState state, String result) {
        ChainOperationStream chainOperationStream = this.getById(chainOperationLogId);
        chainOperationStream.setResult(result);
        chainOperationStream.setState(state);
        return this.updateById(chainOperationStream);
    }
}
