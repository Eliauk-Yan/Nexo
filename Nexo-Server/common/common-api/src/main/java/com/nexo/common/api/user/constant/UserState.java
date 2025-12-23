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

    NORMAL("NORMAL", "正常"),

    UNVERIFIED("UNVERIFIED", "未实名"),

    AUTHENTICATED("AUTHENTICATED", "已实名"),

    RISK_CONTROL("RISK_CONTROL", "风控中"),

    BLACKLIST("BLACKLIST", "黑名单"),

    FROZEN("FROZEN", "资产冻结"),

    INACTIVE("INACTIVE", "未激活"),

    DEACTIVATED("DEACTIVATED", "已注销");

    private final String code;

    private final String description;
}
