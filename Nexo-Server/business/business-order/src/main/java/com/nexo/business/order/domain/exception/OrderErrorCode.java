package com.nexo.business.order.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OrderErrorCode implements ErrorCode {

    INVENTORY_NOT_ENOUGH("INVENTORY_NOT_ENOUGH", "库存不足"),

    PRODUCT_PRICE_CHANGED("PRODUCT_PRICE_CHANGED", "商品价格已变更"),

    PRODUCT_NOT_AVAILABLE("PRODUCT_NOT_AVAILABLE", "商品不可用"),

    BUYER_NOT_AUTH("BUYER_NOT_AUTH", "买家未完成实名认证"),

    BUYER_STATUS_ABNORMAL("BUYER_STATUS_ABNORMAL", "买家状态异常"),

    BUYER_IS_PLATFORM_USER("BUYER_IS_PLATFORM_USER", "买家不能是平台用户");

    private final String code;

    private final String message;

}
