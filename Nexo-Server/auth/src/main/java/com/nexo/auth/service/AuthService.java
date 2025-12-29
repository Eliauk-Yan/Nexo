package com.nexo.auth.service;

import com.nexo.auth.interfaces.dto.LoginDTO;
import com.nexo.auth.interfaces.vo.LoginVO;

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
    LoginVO login(LoginDTO request);
}
