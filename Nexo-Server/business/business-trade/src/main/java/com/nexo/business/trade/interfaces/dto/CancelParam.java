package com.nexo.business.trade.interfaces.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 主动关单请求参数
 */
@Getter
@Setter
public class CancelParam {

    @NotNull(message = "订单号不能为空")
    private String orderId;

}
