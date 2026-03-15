package com.nexo.auth.service;

import com.nexo.auth.interfaces.dto.LoginDTO;
import com.nexo.auth.interfaces.vo.LoginVO;

public interface AuthService {

    /**
     * 发送短信验证码
     */
    Boolean sendSmsVerifyCode(String phone);

    /**
     * 登录
     */
    LoginVO login(LoginDTO request);

    /**
     * 管理员登录
     */
    LoginVO loginAdmin(LoginDTO request);
}
