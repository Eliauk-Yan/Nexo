package com.nexo.business.blockchain.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.business.blockchain.domain.enums.ChainOperationBizType;
import com.nexo.business.blockchain.domain.enums.ChainOperationState;
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
@TableName("chain_operation_log")
public class ChainOperationLog extends BaseEntity {

    /**
     * 链类型(代码)
     */
    @TableField("chain_type")
    private String chainType;

    /**
     * 业务类型(代码)
     */
    @TableField("biz_type")
    private ChainOperationBizType bizType;

    /**
     * 业务 ID
     */
    @TableField("biz_id")
    private String bizId;

    /**
     * 操作类型(代码)
     */
    @TableField("operation_type")
    private String operationType;

    /**
     * 状态(代码)
     */
    @TableField("state")
    private ChainOperationState state;

    /**
     * 操作发起时间
     */
    @TableField("operate_time")
    private LocalDateTime operateTime;

    /**
     * 成功时间
     */
    @TableField("succeed_time")
    private LocalDateTime succeedTime;

    /**
     * 外部业务 id
     */
    @TableField("out_biz_id")
    private String outBizId;

    /**
     * 入参
     */
    @TableField(value = "param")
    private String param;

    /**
     * 返回结果
     */
    @TableField(value = "result")
    private String result;
}

