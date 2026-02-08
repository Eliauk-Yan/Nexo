package com.nexo.business.artwork.domain.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum AssetState {

    INIT("init", "初始化"),

    ACTIVE("active", "激活"),

    INACTIVE("inactive", "非激活"),

    ARCHIVED("archived", "已归档");

    @EnumValue
    private final String code;  // 状态码

    private final String description;  // 状态描述

}
