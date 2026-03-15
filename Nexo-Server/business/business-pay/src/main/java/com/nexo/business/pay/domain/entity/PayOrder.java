package com.nexo.business.pay.domain.entity;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.pay.constant.PayState;
import com.nexo.common.api.pay.request.PayCreateRequest;
import com.nexo.common.api.user.constant.UserType;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付单实体
 */
@EqualsAndHashCode(callSuper = true)
@TableName("pay_order")
@Data
public class PayOrder extends BaseEntity {

    /**
     * 默认超时时间（分钟）
     */
    public static final int DEFAULT_TIME_OUT_MINUTES = 30;

    /**
     * 支付单号
     */
    @TableField("pay_order_id")
    private String payOrderId;

    /**
     * 付款方ID
     */
    @TableField("payer_id")
    private String payerId;

    /**
     * 付款方类型
     */
    @TableField("payer_type")
    private UserType payerType;

    /**
     * 收款方ID
     */
    @TableField("payee_id")
    private String payeeId;

    /**
     * 收款方类型
     */
    @TableField("payee_type")
    private UserType payeeType;

    /**
     * 业务单号
     */
    @TableField("biz_no")
    private String bizNo;

    /**
     * 业务类型
     */
    @TableField("biz_type")
    private String bizType;

    /**
     * 订单金额
     */
    @TableField("order_amount")
    private BigDecimal orderAmount;

    /**
     * 已支付金额
     */
    @TableField("paid_amount")
    private BigDecimal paidAmount;

    /**
     * 渠道流水号
     */
    @TableField("channel_stream_id")
    private String channelStreamId;

    /**
     * 支付链接
     */
    @TableField("pay_url")
    private String payUrl;

    /**
     * 支付渠道
     */
    @TableField("pay_channel")
    private String payChannel;

    /**
     * 备注
     */
    @TableField("memo")
    private String memo;

    /**
     * 支付单状态
     */
    @TableField("order_state")
    private PayState orderState;

    /**
     * 支付成功时间
     */
    @TableField("pay_succeed_time")
    private LocalDateTime paySucceedTime;

    /**
     * 支付超时时间
     */
    @TableField("pay_expire_time")
    private LocalDateTime payExpireTime;

    /**
     * 退款金额
     */
    @TableField("refunded_amount")
    private BigDecimal refundedAmount;

    /**
     * 退款渠道流水号
     */
    @TableField("refund_channel_stream_id")
    private String refundChannelStreamId;

    // ============ 状态机方法 ============
    /**
     * 创建支付单
     */
    public static PayOrder create(PayCreateRequest request) {
        PayOrder payOrder = new PayOrder();
        payOrder.setPayOrderId(IdUtil.getSnowflakeNextIdStr());
        payOrder.setPayerId(request.getPayerId());
        payOrder.setPayerType(request.getPayerType());
        payOrder.setPayeeId(request.getPayeeId());
        payOrder.setPayeeType(request.getPayeeType());
        payOrder.setBizNo(request.getBizNo());
        payOrder.setBizType(request.getBizType());
        payOrder.setOrderAmount(request.getOrderAmount());
        payOrder.setPaidAmount(BigDecimal.ZERO);
        payOrder.setPayChannel(request.getPayChannel().getCode());
        payOrder.setMemo(request.getMemo());
        payOrder.setOrderState(PayState.TO_PAY);
        return payOrder;
    }

    /**
     * 推进到支付中
     */
    public PayOrder paying(String payUrl) {
        this.setOrderState(PayState.PAYING);
        this.payUrl = payUrl;
        return this;
    }

    /**
     * 支付成功
     */
    public PayOrder paySuccess(String channelStreamId, BigDecimal paidAmount) {
        this.setOrderState(PayState.PAID);
        this.paySucceedTime = LocalDateTime.now();
        this.channelStreamId = channelStreamId;
        this.paidAmount = paidAmount;
        return this;
    }

    /**
     * 支付失败
     */
    public PayOrder payFailed() {
        this.setOrderState(PayState.FAILED);
        return this;
    }

    /**
     * 支付超时
     */
    public PayOrder payExpired() {
        this.setOrderState(PayState.EXPIRED);
        this.payExpireTime = LocalDateTime.now();
        return this;
    }

    /**
     * 是否已付款
     */
    public boolean isPaid() {
        return paidAmount != null
                && paidAmount.compareTo(BigDecimal.ZERO) > 0
                && (orderState == PayState.PAID || orderState == PayState.REFUNDED)
                && channelStreamId != null
                && paySucceedTime != null;
    }
}
