package com.nexo.admin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexo.admin.domain.dto.UserCreateDTO;
import com.nexo.admin.domain.dto.UserQueryDTO;
import com.nexo.admin.domain.dto.UserUpdateDTO;
import com.nexo.admin.domain.vo.UserVO;
import com.nexo.admin.service.UserService;
import com.nexo.common.web.result.MultiResult;
import com.nexo.common.web.result.Result;
import jakarta.validation.Valid;
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
    public MultiResult<UserVO> list(UserQueryDTO dto) {
        return userService.getUserList(dto);
    }

    @PostMapping
    public Result<Boolean> add(@Valid @RequestBody UserCreateDTO dto) {
        return Result.success(userService.addUser(dto));
    }

    @PutMapping
    public Result<Boolean> update(@Valid @RequestBody UserUpdateDTO dto) {
        return Result.success(userService.updateUser(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(userService.deleteUser(id));
    }

}
