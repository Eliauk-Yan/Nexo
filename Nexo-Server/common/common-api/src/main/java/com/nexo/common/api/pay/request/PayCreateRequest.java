package com.nexo.common.api.pay.request;

import com.nexo.common.api.common.request.BaseRequest;
import com.nexo.common.api.pay.constant.PaymentType;
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
    private String payerType;

    /**
     * 收款方ID
     */
    private String payeeId;

    /**
     * 收款方类型
     */
    private String payeeType;

    /**
     * 支付渠道
     */
    @NotNull(message = "支付渠道不能为空")
    private PaymentType payChannel;

    /**
     * 备注
     */
    private String memo;
}
