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

    BUYER_IS_PLATFORM_USER("BUYER_IS_PLATFORM_USER", "买家不能是平台用户"),

    ORDER_NOT_EXIST("ORDER_NOT_EXIST", "订单不存在"),

    PERMISSION_DENIED("PERMISSION_DENIED", "没有权限操作"),

    ORDER_STATE_ILLEGAL("ORDER_STATE_ILLEGAL", "订单状态非法"),

    UPDATE_ORDER_FAILED("UPDATE_ORDER_FAILED", "更新订单失败"),

    INSERT_ORDER_FAILED("INSERT_ORDER_FAILED", "插入订单失败"),

    ORDER_STREAM_INSERT_FAILED("ORDER_STREAM_INSERT_FAILED", "订单流水插入失败"),

    ORDER_CREATE_VALID_FAILED("ORDER_CREATE_VALID_FAILED", "订单创建验证失败"),

    INVENTORY_INCREASE_FAILED("INVENTORY_INCREASE_FAILED", "库存增加失败");

    private final String code;

    private final String message;

}
