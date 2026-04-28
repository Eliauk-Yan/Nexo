package com.nexo.business.chain.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.constant.ChainOperationState;
import com.nexo.common.api.blockchain.constant.ChainType;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * @classname ChainOperationLog
 * @description 链操作日志
 * @date 2025/12/24 19:56
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("chain_operation_stream")
public class ChainOperationStream extends BaseEntity {

    /**
     * 链类型
     */
    private ChainType chainType;

    /**
     * 业务类型
     */
    private ChainOperationBizType bizType;

    /**
     * 业务ID
     */
    private String bizId;

    /**
     * 操作类型
     */
    private ChainOperateType operationType;

    /**
     * 状态
     */
    private ChainOperationState state;

    /**
     * 操作发起时间
     */
    private LocalDateTime operateTime;

    /**
     * 成功时间
     */
    private LocalDateTime succeedTime;

    /**
     * 外部业务 id
     */
    private String outBizId;

    /**
     * 幂等号
     */
    private String identifier;

    /**
     * 入参
     */
    private String param;

    /**
     * 返回结果
     */
    private String result;

    /**
     * 初始化
     */
    public void init(ChainType chainType, String bizId, ChainOperationBizType bizType, ChainOperateType operateType, String param, String identifier) {
        this.chainType = chainType;
        this.bizType = bizType;
        this.bizId = bizId;
        this.operationType = operateType;
        this.param = param;
        this.identifier = identifier;
        this.state = ChainOperationState.INIT;
    }

    /**
     * 处理中
     */
    public void processing() {
        this.operateTime = LocalDateTime.now();
        this.state = ChainOperationState.PROCESSING;
    }

    /**
     * 成功
     */
    public void success(String outBizId, String result) {
        this.state = ChainOperationState.SUCCESS;
        this.succeedTime = LocalDateTime.now();
        this.outBizId = outBizId;
        this.result = result;
    }

    /**
     * 失败
     */
    public void failed(String result) {
        this.state = ChainOperationState.FAILED;
        this.result = result;
    }
}

