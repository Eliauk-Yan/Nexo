package com.nexo.common.api.order.request;

import com.nexo.common.api.order.constant.TradeOrderEvent;
import com.nexo.common.api.pay.constant.PaymentType;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.math.BigDecimal;

/**
 * 订单支付成功请求
 */
@Getter
@Setter
public class OrderPayRequest extends OrderUpdateRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 支付金额
     */
    private BigDecimal paymentAmount;

    /**
     * 支付方式
     */
    private PaymentType paymentMethod;

    /**
     * 支付流水号
     */
    private String paymentStreamId;

    @Override
    public TradeOrderEvent getOrderEvent() {
        return TradeOrderEvent.PAY;
    }
}
