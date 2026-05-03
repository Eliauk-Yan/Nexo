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

    PAY_PERMISSION_DENIED("PAY_PERMISSION_DENIED", "无支付权限"),

    ORDER_IS_CANNOT_PAY("ORDER_IS_CANNOT_PAY", "订单不可支付"),

    ORDER_NOT_EXIST("ORDER_NOT_EXIST", "订单不存在"),

    GOODS_NOT_FOR_SALE("GOODS_NOT_FOR_SALE", "商品不可售卖"),

    ORDER_CREATE_FAILED("ORDER_CREATE_FAILED", "订单创建失败"),

    ORDER_CANCEL_FAILED("ORDER_CANCEL_FAILED", "订单取消失败"),

    IAP_TRANSACTION_REUSED("IAP_TRANSACTION_REUSED", "应用内购买交易已被其他订单使用"),

    IAP_PURCHASE_PROOF_INVALID("IAP_PURCHASE_PROOF_INVALID", "应用内购买凭据无效"),

    INVENTORY_ROLLBACK_FAILED("INVENTORY_ROLLBACK_FAILED", "库存回滚失败");

    private final String code;

    private final String message;

}
