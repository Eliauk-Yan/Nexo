package com.nexo.business.user.interfaces.facade;

import com.nexo.business.user.service.UserService;
import com.nexo.common.api.common.response.ResponseCode;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.UserRegisterRequest;
import com.nexo.common.api.user.request.condition.UserQueryById;
import com.nexo.common.api.user.request.condition.UserQueryByPhone;
import com.nexo.common.api.user.request.condition.UserQueryByPhoneAndPassword;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * @classname UserFacadeImpl
 * @description 用户模块对外接口
 * @date 2025/12/02 09:03
 * @created by YanShijie
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class UserFacadeImpl implements UserFacade {

    private final UserService userService;

    @Override
    public UserQueryResponse<UserInfo> userQuery(UserQueryRequest request) {
        // 1. 根据条件查询用户信息
        UserInfo info = switch (request.getCondition()) {
            case UserQueryByPhone(String phone) -> userService.queryUserByPhone(phone);
            case UserQueryById(Long id) -> userService.queryUserById(id);
            case UserQueryByPhoneAndPassword(String phone, String password) ->
                userService.queryUserByPhoneAndPassword(phone, password);
        };
        // 2. 组装响应结果
        UserQueryResponse<UserInfo> response = new UserQueryResponse<>();
        response.setData(info);
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.getCode());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        // 3. 返回响应
        return response;
    }

    @Override
    public UserResponse register(UserRegisterRequest request) {
        // 1. 注册用户
        userService.register(request.getPhone(), request.getInviteCode());
        // 2. 组装响应结果
        UserResponse response = new UserResponse();
        response.setSuccess(true);
        // 3. 返回响应
        return response;
    }

    @Override
    public UserQueryResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.nexo.common.api.user.response.data.UserDTO>> getUserList(
            com.nexo.common.api.user.request.UserListQueryRequest request) {
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.nexo.business.user.domain.entity.User> page = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(
                request.getCurrent(), request.getSize());
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.nexo.business.user.domain.entity.User> wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        if (request.getNickName() != null && !request.getNickName().isEmpty()) {
            wrapper.like(com.nexo.business.user.domain.entity.User::getNickName, request.getNickName());
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            wrapper.eq(com.nexo.business.user.domain.entity.User::getPhone, request.getPhone());
        }
        wrapper.orderByDesc(com.nexo.business.user.domain.entity.User::getCreatedAt);

        com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.nexo.business.user.domain.entity.User> userPage = userService
                .page(page, wrapper);

        com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.nexo.common.api.user.response.data.UserDTO> dtoPage = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(
                userPage.getCurrent(), userPage.getSize(), userPage.getTotal());
        dtoPage.setRecords(userPage.getRecords().stream().map(u -> {
            com.nexo.common.api.user.response.data.UserDTO dto = new com.nexo.common.api.user.response.data.UserDTO();
            org.springframework.beans.BeanUtils.copyProperties(u, dto);
            return dto;
        }).toList());

        UserQueryResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.nexo.common.api.user.response.data.UserDTO>> response = new UserQueryResponse<>();
        response.setData(dtoPage);
        return response;
    }

    @Override
    public Boolean addUser(com.nexo.common.api.user.response.data.UserDTO userDTO) {
        com.nexo.business.user.domain.entity.User user = new com.nexo.business.user.domain.entity.User();
        org.springframework.beans.BeanUtils.copyProperties(userDTO, user);
        return userService.save(user);
    }

    @Override
    public Boolean updateUser(com.nexo.common.api.user.response.data.UserDTO userDTO) {
        com.nexo.business.user.domain.entity.User user = new com.nexo.business.user.domain.entity.User();
        org.springframework.beans.BeanUtils.copyProperties(userDTO, user);
        return userService.updateById(user);
    }

    @Override
    public Boolean deleteUser(Long id) {
        return userService.removeById(id);
    }
}
