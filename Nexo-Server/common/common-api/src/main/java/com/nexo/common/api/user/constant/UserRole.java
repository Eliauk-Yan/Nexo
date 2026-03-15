package com.nexo.common.api.user.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 用户角色枚举
 */
@Getter
@AllArgsConstructor
public enum UserRole {

    COLLECTOR("COLLECTOR", "收藏者"),

    ADMIN("ADMIN", "管理员");

    private final String code;

    private final String description;

}
