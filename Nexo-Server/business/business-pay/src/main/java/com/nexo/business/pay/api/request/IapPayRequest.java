package com.nexo.business.pay.api.request;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * 应用内购买支付请求
 */
@Getter
@Setter
public class IapPayRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 支付单号
     */
    private String outTradeNo;

    /**
     * 金额（单位：分）
     */
    private Long totalFee;

    /**
     * 订单描述
     */
    private String description;

    /**
     * 附加信息
     */
    private String attach;

    /**
     * 应用内购买商品ID
     */
    private String productId;

    /**
     * 应用内购买交易ID
     */
    private String transactionId;

    /**
     * 应用内购买凭证或购买令牌
     */
    private String purchaseToken;
}
