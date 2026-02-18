package com.nexo.common.api.user.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 用户角色枚举
 */
@Getter
@AllArgsConstructor
public enum UserRole {

    /**
     * 普通收藏者
     */
    COLLECTOR("COLLECTOR"),

    /**
     * 艺术家
     */
    ARTIST("ARTIST"),

    /**
     * 管理员
     */
    ADMIN("ADMIN"),

    /**
     * （隐藏用户）菜单
     */
    ROOT("ROOT"),

    /**
     * 神
     */
    GOD("GOD");


    private final String code;

}
