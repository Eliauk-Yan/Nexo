package com.nexo.admin.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.admin.domain.dto.LoginDTO;
import com.nexo.admin.domain.vo.LoginVO;
import com.nexo.admin.service.AuthService;
import com.nexo.common.web.result.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @classname AuthController
 * @description 管理系统认证控制器
 * @date 2026/02/19 01:25
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 管理员登录
     * @param params 登录参数
     * @return 用户西悉尼
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO params) {
        return Result.success(authService.login(params));
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
