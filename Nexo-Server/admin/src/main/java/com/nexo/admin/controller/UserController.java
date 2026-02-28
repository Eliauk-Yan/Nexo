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

    /**
     * 获取用户列表
     * @param dto 用户查询参数
     * @return 用户列表
     */
    @GetMapping("/list")
    public MultiResult<UserVO> list(@Valid UserQueryDTO dto) {
        return userService.getUserList(dto);
    }

    /**
     * 冻结用户
     * @param userId 用户ID
     * @return 操作结果
     */
    @PostMapping("/freeze")
    public Result<Boolean> freeze(@Valid Long userId) {
        return Result.success(userService.freeze(userId));
    }

    /**
     * 解冻用户
      * @param userId 用户ID
      * @return 操作结果
     */
    @PostMapping("/unfreeze")
    public Result<Boolean> unfreeze(@Valid Long userId) {
        return Result.success(userService.unfreeze(userId));
    }

}
