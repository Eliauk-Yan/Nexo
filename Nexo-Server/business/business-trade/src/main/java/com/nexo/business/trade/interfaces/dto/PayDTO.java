package com.nexo.business.trade.interfaces.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayDTO {

    @NotNull(message = "订单号不能为空")
    private String orderId;

    /**
     * 应用内购买商品ID
     */
    private String iapProductId;

    /**
     * 应用内购买交易ID
     */
    private String iapTransactionId;

    /**
     * 应用内购买凭证或购买令牌
     */
    private String iapPurchaseToken;

}
