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
    COLLECTOR("collector"),

    /**
     * 艺术家
     */
    ARTIST("artist"),

    /**
     * 管理员
     */
    ADMIN("admin"),

    /**
     * （隐藏用户）菜单
     */
    ROOT("root"),

    /**
     * 神
     */
    GOD("shadow");


    private final String code;

}
