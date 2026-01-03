package com.nexo.auth.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.auth.interfaces.dto.LoginDTO;
import com.nexo.auth.interfaces.vo.LoginVO;
import com.nexo.auth.service.AuthService;
import com.nexo.common.limiter.annotation.RateLimit;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @classname AuthController
 * @description 认证控制类
 * @date 2025/12/01 18:01
 * @created by YanShijie
 */
@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 发送验证码接口
     * @param phone 手机号
     * @return 发送结果
     */
    @RateLimit(key = "#phone", limit = 1, windowSize = 60, message = "短信验证码发送频繁，请稍后再试")
    @PostMapping("/verifyCode")
    public Result<Boolean> sendSmsVerifyCode(@RequestParam String phone) {
        return Result.success(authService.sendSmsVerifyCode(phone));
    }

    /**
     * 登录或注册接口
     * @param request 请求参数
     * @return 登录结果
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody LoginDTO request) {
        return Result.success(authService.login(request));
    }

    /**
     * 退出登录
     * @return 返回结果
     */
    @PostMapping("/logout")
    public Result<Boolean> logout() {
        StpUtil.logout();
        return Result.success(true);
    }
}
