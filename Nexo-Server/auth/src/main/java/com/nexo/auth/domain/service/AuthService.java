package com.nexo.auth.domain.service;

import com.nexo.auth.interfaces.dto.request.LoginRequest;
import com.nexo.auth.interfaces.dto.request.RegisterRequest;
import com.nexo.auth.interfaces.dto.response.LoginResponse;

public interface AuthService {

    /**
     * 发送短信验证码
     * @param phone 手机号
     * @return 发送结果
     */
    Boolean sendSmsVerifyCode(String phone);

    /**
     * 登录
     * @param request 登录参数
     * @return 登录结果
     */
    LoginResponse login(LoginRequest request);
}
