package com.nexo.common.api.pay.request;

import com.nexo.common.api.pay.constant.PayState;
import com.nexo.common.base.request.BaseRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class PayQueryRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "业务订单号不能为空")
    private String bizNo;

    @NotNull(message = "业务订单类型不能为空")
    private String bizType;

    @NotNull(message = "支付者ID不能为空")
    private String payerId;

    private PayState payState;

}
