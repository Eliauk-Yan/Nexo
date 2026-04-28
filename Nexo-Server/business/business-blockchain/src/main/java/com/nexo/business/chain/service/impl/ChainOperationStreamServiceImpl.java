package com.nexo.business.chain.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.chain.domain.entity.ChainOperationStream;
import com.nexo.business.chain.domain.exception.ChainException;
import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.constant.ChainOperationState;
import com.nexo.common.api.blockchain.constant.ChainType;
import com.nexo.business.chain.mapper.mybatis.ChainOperationStreamMapper;
import com.nexo.business.chain.service.ChainOperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import static com.nexo.business.chain.domain.exception.ChainErrorCode.*;

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
                .eq(ChainOperationStream::getIdentifier, identifier);
        return this.getOne(wrapper);
    }

    @Override
    public Long insertLog(ChainType chainType, String bizId, ChainOperationBizType bizType, ChainOperateType operateType, String param, String identifier) {
        // 1. 初始化 链操作流水
        ChainOperationStream stream = new ChainOperationStream();
        stream.init(chainType, bizId, bizType, operateType, param, identifier);
        // 2. 处理中
        stream.processing();
        // 3. 插入流水
        boolean res = this.save(stream);
        if (!res) {
            throw new ChainException(STREAM_INSERT_FAILED);
        }
        // 返回结果
        return stream.getId();
    }

    @Override
    public ChainOperationStream updateLog(Long streamId, ChainOperationState state, String result, String outBizId) {
        ChainOperationStream stream = this.getById(streamId);
        if (stream == null) {
            throw new ChainException(STREAM_NOT_FOUND);
        }
        if (state == ChainOperationState.SUCCESS) {
            stream.success(outBizId, result);
        } else if (state == ChainOperationState.FAILED) {
            stream.failed(result);
        } else {
            throw new RuntimeException("类型不支持");
        }
        boolean res = this.updateById(stream);
        if (!res) {
            throw new ChainException(STREAM_UPDATE_FAILED);
        }
        return stream;
    }
}
