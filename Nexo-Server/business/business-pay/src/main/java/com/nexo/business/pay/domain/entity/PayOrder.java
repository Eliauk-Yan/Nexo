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
    private String payOrderId;

    /**
     * 付款方ID
     */
    private String payerId;

    /**
     * 付款方类型
     */
    private UserType payerType;

    /**
     * 收款方ID
     */
    private String payeeId;

    /**
     * 收款方类型
     */
    private UserType payeeType;

    /**
     * 业务单号
     */
    private String bizNo;

    /**
     * 业务类型
     */
    private String bizType;

    /**
     * 订单金额
     */
    private BigDecimal orderAmount;

    /**
     * 已支付金额
     */
    private BigDecimal paidAmount;

    /**
     * 渠道流水号
     */
    private String channelStreamId;

    /**
     * 支付链接
     */
    private String payUrl;

    /**
     * 备注
     */
    private String memo;

    /**
     * 支付单状态
     */
    private PayState orderState;

    /**
     * 支付成功时间
     */
    private LocalDateTime paySucceedTime;

    /**
     * 支付超时时间
     */
    private LocalDateTime payExpireTime;

    /**
     * 退款金额
     */
    private BigDecimal refundedAmount;

    /**
     * 退款渠道流水号
     */
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
        payOrder.setMemo(request.getMemo());
        payOrder.setOrderState(PayState.TO_PAY);
        return payOrder;
    }

    /**
     * 推进到支付中
     */
    public void paying() {
        this.setOrderState(PayState.PAYING);
    }

    /**
     * 支付成功
     */
    public void paySuccess(String channelStreamId, BigDecimal paidAmount) {
        this.setOrderState(PayState.PAID);
        this.paySucceedTime = LocalDateTime.now();
        this.channelStreamId = channelStreamId;
        this.paidAmount = paidAmount;
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
