package com.nexo.common.api.pay.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PaymentType {

    IAP("IAP", "应用内购买");

    private final String code;

    private final String description;

}
