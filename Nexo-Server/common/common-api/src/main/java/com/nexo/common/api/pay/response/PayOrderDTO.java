package com.nexo.common.api.pay.response;

import com.nexo.common.api.pay.constant.PayState;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付单数据传输对象
 */
@Getter
@Setter
public class PayOrderDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 支付单号
     */
    private String payOrderId;

    /**
     * 支付单状态
     */
    private PayState orderState;

    /**
     * 已支付金额
     */
    private BigDecimal paidAmount;

    /**
     * 支付成功时间
     */
    private LocalDateTime paySucceedTime;

    /**
     * 业务单号
     */
    private String bizNo;

    /**
     * 支付渠道
     */
    private String payChannel;

    /**
     * 微信App支付参数
     */
    private WechatPayParamsDTO wechatPayParams;
}
