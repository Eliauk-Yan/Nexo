package com.nexo.common.api.user.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserType {

    CUSTOMER("CUSTOMER", "用户"),

    PLATFORM("PLATFORM", "平台");

    private final String code;

    private final String description;

}
