package com.nexo.business.user.interfaces.facade;

import com.nexo.business.user.service.UserService;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.UserRegisterRequest;
import com.nexo.common.api.user.request.condition.UserQueryByPhone;
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
        };
        // 2. 组装响应结果
        UserQueryResponse<UserInfo> response = new UserQueryResponse<>();
        response.setData(info);
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
}
