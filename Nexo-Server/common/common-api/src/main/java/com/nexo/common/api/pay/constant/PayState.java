package com.nexo.common.api.pay.constant;

import com.alibaba.fastjson2.annotation.JSONField;
import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PayState {

    TO_PAY("TO_PAY", "待支付"),

    PAYING("PAYING", "支付中"),

    PAID("PAID", "已付款"),

    FAILED("FAILED", "支付失败"),

    EXPIRED("EXPIRED", "支付超时"),

    REFUNDED("REFUNDED", "已退款");

    @JSONField
    private final String code;

    @EnumValue
    private final String description;
}
