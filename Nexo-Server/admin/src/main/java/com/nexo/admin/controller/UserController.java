package com.nexo.admin.controller;

import com.nexo.common.web.result.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexo.admin.domain.dto.UserQueryDTO;
import com.nexo.admin.domain.vo.UserVO;
import com.nexo.admin.service.UserService;
import com.nexo.common.web.result.MultiResult;
import org.springframework.web.bind.annotation.*;

/**
 * @classname UserController
 * @description 管理员用户管理控制器
 * @date 2026/02/19 01:21
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/user")
public class UserController {

    private final UserService userService;

    @GetMapping("/list")
    public MultiResult<UserVO> list(@Valid UserQueryDTO dto) {
        return userService.getUserList(dto);
    }

    @PostMapping("/freeze")
    public Result<Boolean> freeze(@Valid Long userId) {
        return Result.success(userService.freeze(userId));
    }

    @PostMapping("/unfreeze")
    public Result<Boolean> unfreeze(@Valid Long userId) {
        return Result.success(userService.unfreeze(userId));
    }

}
