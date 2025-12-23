package com.nexo.business.user.controller;

import com.nexo.business.user.service.UserService;
import com.nexo.business.user.domain.dto.request.UserUpdateRequest;
import com.nexo.business.user.domain.dto.response.UserProfile;
import com.nexo.common.web.vo.Result;
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
     * @return 用户信息
     */
    @GetMapping("/profile")
    public Result<UserProfile> getUserInfo() {
        return Result.success(userService.getUserProfile());
    }

    /**
     * 更新用户头像
     * @param avatar 头像图片
     * @return 更新结果
     */
    @PutMapping("/avatar")
    public Result<Boolean> updateAvatar(@RequestParam MultipartFile avatar) {
        return Result.success(userService.updateAvatar(avatar));
    }

    /**
     * 更新用户昵称
     * @return 更新结果
     */
    @PutMapping("/nickName")
    public Result<Boolean> updateNickName(@RequestBody UserUpdateRequest request) {
        return Result.success(userService.updateNickName(request.getNickName()));
    }

}
