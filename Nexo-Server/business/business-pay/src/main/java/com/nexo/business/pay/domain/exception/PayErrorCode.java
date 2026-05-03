package com.nexo.business.pay.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum PayErrorCode implements ErrorCode {

    ORDER_ALREADY_PAID("ORDER_ALREADY_PAID", "订单已支付"),

    PAY_ORDER_UPDATE_FAILED("PAY_ORDER_UPDATE_FAILED", "支付单更新失败");

    private final String code;

    private final String message;
}
