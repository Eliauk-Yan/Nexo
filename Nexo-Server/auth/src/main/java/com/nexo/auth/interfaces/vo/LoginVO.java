package com.nexo.auth.interfaces.vo;

import com.nexo.common.api.user.response.data.UserInfo;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @classname LoginResponse
 * @description 登录响应
 * @date 2025/12/01 20:48
 * @created by YanShijie
 */
@Data
@AllArgsConstructor
public class LoginVO {

    /**
     * 登录 Token
     */
    private String token;

    /**
     * 登录过期时间
     */
    private Long expire;

    /**
     * 用户信息
     */
    private UserInfo userInfo;

}
