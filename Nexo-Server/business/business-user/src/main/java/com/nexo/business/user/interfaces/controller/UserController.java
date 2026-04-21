package com.nexo.business.user.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.business.user.domain.exception.UserException;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserService;
import com.nexo.business.user.interfaces.dto.UserUpdateDTO;
import com.nexo.common.api.user.response.data.SimpleUserInfo;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.web.result.Result;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.nexo.business.user.domain.exception.UserErrorCode.USER_NOT_EXIST;


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

    @GetMapping("/info/phone")
    public Result<SimpleUserInfo> getUserInfoByPhone(@NotNull(message = "手机号不能为空") String phone) {
        UserInfo userInfo = userService.queryUserByPhone(phone);
        if (userInfo == null) {
            throw new UserException(USER_NOT_EXIST);
        }
        SimpleUserInfo simpleUserInfo = new SimpleUserInfo();
        simpleUserInfo.setId(userInfo.getId());
        simpleUserInfo.setNickName(userInfo.getNickName());
        simpleUserInfo.setAvatarUrl(userInfo.getAvatarUrl());
        return Result.success(simpleUserInfo);
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
