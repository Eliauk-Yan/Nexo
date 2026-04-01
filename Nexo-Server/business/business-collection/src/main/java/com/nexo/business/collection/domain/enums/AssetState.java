package com.nexo.business.collection.domain.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum AssetState {

    INIT("INIT", "初始化"),

    ACTIVE("ACTIVE", "激活");

    private final String code;  // 状态码

    private final String description;  // 状态描述

}
