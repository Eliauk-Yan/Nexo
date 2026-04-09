package com.nexo.common.api.pay.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PaymentType {

    MOCK("MOCK", "Mock"),

    APPLE_PAY("APPLE_PAY", "Apple Pay");

    private final String code;

    private final String description;

}