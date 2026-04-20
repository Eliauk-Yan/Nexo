package com.nexo.auth.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.auth.interfaces.dto.AppleLoginDTO;
import com.nexo.auth.interfaces.dto.LoginDTO;
import com.nexo.auth.interfaces.dto.TokenDTO;
import com.nexo.auth.interfaces.vo.LoginVO;
import com.nexo.auth.service.AuthService;
import com.nexo.auth.service.TokenService;
import com.nexo.common.api.notification.NotificationFacade;
import com.nexo.common.api.notification.response.NotificationResponse;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
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
     * 通知服务接口
     */
    @DubboReference(version = "1.0.0")
    private NotificationFacade notificationFacade;

    /**
     * 发送验证码接口
     */
    @PostMapping("/verifyCode")
    public Result<Boolean> sendSmsVerifyCode(@RequestParam String phone) {
        NotificationResponse response = notificationFacade.sendSmsVerifyCode(phone);
        return Result.success(response.getSuccess());
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
