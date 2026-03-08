package com.nexo.business.trade.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname TradeErrorCode
 * @description 交易模块错误码
 * @date 2026/02/08 17:04
 */
@Getter
@AllArgsConstructor
public enum TradeErrorCode implements ErrorCode {

    ORDER_IS_CANNOT_PAY("ORDER_IS_CANNOT_PAY", "订单不可支付"),

    ORDER_NOT_EXIST("ORDER_NOT_EXIST", "订单不存在"),

    GOODS_NOT_FOR_SALE("GOODS_NOT_FOR_SALE", "商品不可售卖"),

    ORDER_CREATE_FAILED("ORDER_CREATE_FAILED", "订单创建失败");

    private final String code;

    private final String message;

}
