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
     * 应用内购买商品ID
     */
    private String productId;

    /**
     * 应用内购买交易ID
     */
    private String transactionId;
}
