package com.nexo.common.api.order.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname TradeOrderEvent
 * @description 订单事件枚举
 * @date 2026/02/15 01:03
 */
@Getter
@AllArgsConstructor
public enum TradeOrderEvent {

    CREATE("CREATE", "订单创建"),

    CONFIRM("CONFIRM", "订单确认"),

    CREATE_AND_CONFIRM("CREATE_AND_CONFIRM", "订单创建并确认"),

    PAY("PAY", "订单支付"),

    CANCEL("CANCEL", "订单取消"),

    TIME_OUT("TIME_OUT", "订单超时"),

    FINISH("FINISH", "订单完成"),

    DISCARD("DISCARD", "订单废弃");

    private final String code;

    private final String message;

}
