package com.nexo.common.api.order.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname TradeOrderState
 * @description 订单状态
 * @date 2026/02/08 02:30
 */
@Getter
@AllArgsConstructor
public enum TradeOrderState {

    CREATE("CREATE", "订单创建"),

    CONFIRM("CONFIRM", "订单确认"),

    PAID("PAID", "已付款"),

    FINISH("FINISH", "交易成功"),

    CLOSED("CLOSED", "订单关闭"),

    DISCARD("DISCARD", "废单，用户看不到");

    private final String code;

    private final String description;

}
