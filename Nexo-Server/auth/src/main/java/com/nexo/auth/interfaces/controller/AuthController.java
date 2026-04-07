package com.nexo.auth.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.auth.interfaces.dto.AppleLoginDTO;
import com.nexo.auth.interfaces.dto.LoginDTO;
import com.nexo.auth.interfaces.dto.TokenDTO;
import com.nexo.auth.interfaces.vo.LoginVO;
import com.nexo.auth.service.AuthService;
import com.nexo.auth.service.TokenService;
import com.nexo.common.limiter.annotation.RateLimit;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    private final TokenService tokenService;

    /**
     * 发送验证码接口
     */
    @RateLimit(key = "#phone", limit = 1, windowSize = 60, message = "短信验证码发送频繁，请稍后再试")
    @PostMapping("/verifyCode")
    public Result<Boolean> sendSmsVerifyCode(@RequestParam String phone) {
        return Result.success(authService.sendSmsVerifyCode(phone));
    }

    /**
     * 登录或注册接口
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody LoginDTO request) {
        return Result.success(authService.login(request));
    }

    /**
     * 苹果登录
     */
    @PostMapping("/login/apple")
    public Result<LoginVO> login(@RequestBody AppleLoginDTO dto) {
        return Result.success(authService.loginByApple(dto));
    }

    /**
     * 绑定苹果账号
     */
    @PostMapping("/bind/apple")
    public Result<Boolean> bindByApple(@RequestBody AppleLoginDTO dto) {
        return Result.success(authService.bindByApple(dto));
    }

    /**
     * 管理员登录
     */
    @PostMapping("/login/admin")
    public Result<LoginVO> loginAdmin(@RequestBody LoginDTO request) {
        return Result.success(authService.loginAdmin(request));
    }

    /**
     * 退出登录
     */
    @PostMapping("/logout")
    public Result<Boolean> logout() {
        StpUtil.logout();
        return Result.success(true);
    }

    /**
     * 防止重复提交的token
     */
    @GetMapping("/token")
    public Result<String> getToken(TokenDTO tokenDTO) {
        return Result.success(tokenService.getToken(tokenDTO));
    }
}
