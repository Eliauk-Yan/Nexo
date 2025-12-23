package com.nexo.auth.interfaces.dto.request;

import lombok.Data;

/**
 * @classname LoginRequest
 * @description 登录请求参数
 * @date 2025/12/01 20:47
 * @created by YanShijie
 */
@Data
public class LoginRequest {

    private String phone;

    private String verifyCode;

    private Boolean rememberMe;

}
