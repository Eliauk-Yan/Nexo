package com.nexo.common.api.user.constant;

import com.alibaba.fastjson2.annotation.JSONField;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserType {

    CUSTOMER("CUSTOMER", "用户"),

    PLATFORM("PLATFORM", "平台");

    @JSONField
    private final String code;

    private final String description;

}
