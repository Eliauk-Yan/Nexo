package com.nexo.business.trade.interfaces.dto;

import com.nexo.common.api.pay.constant.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayDTO {

    @NotNull(message = "订单号不能为空")
    private String orderId;

    @NotNull(message = "支付方式不能为空")
    private PaymentType paymentType;

}
