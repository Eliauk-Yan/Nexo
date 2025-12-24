package com.nexo.common.api.user.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname UserState
 * @description 用户状态枚举类
 * @date 2025/12/02 09:48
 * @created by YanShijie
 */
@AllArgsConstructor
@Getter
public enum UserState {

    INIT("INIT", "初始化"),

    AUTHENTICATED("AUTHENTICATED", "已实名"),

    ACTIVE("ACTIVE", "已激活"),

    FROZEN("FROZEN", "资产冻结");

    private final String code;

    private final String description;
}
