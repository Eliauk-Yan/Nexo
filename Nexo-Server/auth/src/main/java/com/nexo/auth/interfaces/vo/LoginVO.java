package com.nexo.auth.interfaces.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname LoginResponse
 * @description 登录响应
 * @date 2025/12/01 20:48
 * @created by YanShijie
 */
@Getter
@Setter
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


}
