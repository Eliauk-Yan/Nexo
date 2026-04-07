package com.nexo.common.api.pay.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PaymentType {

    MOCK("MOCK", "模拟"),



    WECHAT("WECHAT", "微信");

    private final String code;

    private final String description;

}
