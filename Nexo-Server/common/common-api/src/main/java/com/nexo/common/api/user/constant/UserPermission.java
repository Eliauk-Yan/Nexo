package com.nexo.common.api.user.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 用户权限枚举
 */
@Getter
@AllArgsConstructor
public enum UserPermission {

    /**
     * 基础权限
     */
    BASIC("basic"),

    /**
     * 认证权限
     */
    AUTHENTICATE("authenticate"),

    /**
     * 冻结权限
     */
    FROZEN("frozen"),

    /**
     * 无权限
     */
    NONE("none");


    private final String code;
}
