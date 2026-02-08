package com.nexo.common.api.user.response.data;

import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.constant.UserState;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname UserInfo
 * @description 用户登录返回信息
 * @date 2025/12/03 12:58
 * @created by YanShijie
 */
@Data
public class UserInfo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String nickName;

    /**
     * 头像地址
     */
    private String avatarUrl;

    /**
     * 用户角色
     */
    private UserRole role;

    /**
     * 用户状态
     */
    private UserState state;

    /**
     * 是否实名认证
     */
    private Boolean certification;

}
