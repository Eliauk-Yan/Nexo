package com.nexo.business.user.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserService;
import com.nexo.business.user.interfaces.dto.UserUpdateDTO;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


/**
 * @classname UserController
 * @description 用户控制器
 * @date 2025/12/02 09:07
 * @created by YanShijie
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 获取用户信息
     */
    @GetMapping("/profile")
    public Result<UserInfo> getUserInfo() {
        UserInfo userInfo = userService.queryUserById(StpUtil.getLoginIdAsLong());
        return Result.success(userInfo);
    }

    /**
     * 更新用户头像
     */
    @PutMapping("/avatar")
    public Result<Boolean> updateAvatar(@RequestPart("avatar") MultipartFile avatar) {
        return Result.success(userService.updateAvatar(avatar));
    }

    /**
     * 更新用户昵称
     */
    @PutMapping("/nickName")
    public Result<Boolean> updateNickName(@RequestBody UserUpdateDTO request) {
        return Result.success(userService.updateNickName(request.getNickName()));
    }

    /**
     * 实名认证
     */
    @PostMapping("/realNameAuth")
    public Result<Boolean> realNameAuthentication(@RequestBody RealNameAuthDTO dto) {
        userService.realNameAuth(dto);
        return Result.success(true);
    }

}
