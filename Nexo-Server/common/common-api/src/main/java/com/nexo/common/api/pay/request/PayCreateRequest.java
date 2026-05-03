package com.nexo.common.api.pay.request;

import com.nexo.common.base.request.BaseRequest;
import com.nexo.common.api.user.constant.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.math.BigDecimal;

/**
 * 创建支付单请求
 */
@Getter
@Setter
public class PayCreateRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 业务单号（订单号）
     */
    @NotNull(message = "业务单号不能为空")
    private String bizNo;

    /**
     * 业务类型
     */
    @NotNull(message = "业务类型不能为空")
    private String bizType;

    /**
     * 订单金额
     */
    @NotNull(message = "订单金额不能为空")
    private BigDecimal orderAmount;

    /**
     * 付款方ID
     */
    @NotNull(message = "付款方ID不能为空")
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
     * 备注
     */
    private String memo;

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
