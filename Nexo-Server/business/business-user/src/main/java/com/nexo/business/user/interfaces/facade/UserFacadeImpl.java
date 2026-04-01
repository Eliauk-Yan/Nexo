package com.nexo.business.user.interfaces.facade;

import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.mapper.convert.UserConverter;
import com.nexo.business.user.service.UserService;
import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.response.PageResponse;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.request.UserPageQueryRequest;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.UserRegisterRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboService;

import static com.nexo.common.base.exception.code.impl.BusinessErrorCode.PARAM_ERROR;

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

    private final UserConverter userConverter;

    @Override
    public UserQueryResponse<UserInfo> userQuery(UserQueryRequest request) {
        // 1. 根据优先级选择查询分支
        UserInfo info;
        if (request.getId() != null) {
            // 优先根据 ID 查询
            info = userService.queryUserById(request.getId());
        } else if (request.getPhone() != null) {
            // 仅手机号查询
            info = userService.queryUserByPhone(request.getPhone());
        } else {
            // 参数不足，抛出业务异常或返回错误
            throw new BusinessException(PARAM_ERROR);
        }
        // 2. 组装响应结果
        return UserQueryResponse.success(info);
    }

    @Override
    public UserResponse register(UserRegisterRequest request) {
        // 1. 注册用户
        Boolean result = userService.register(request.getPhone());
        // 2. 组装响应结果
        UserResponse response = new UserResponse();
        response.setSuccess(result);
        // 3. 返回响应
        return response;
    }

    @Override
    public PageResponse<UserInfo> pageQuery(UserPageQueryRequest request) {
        PageResponse<User> queryResult = userService.pageQueryByState(request.getKeyword(), request.getState(),
                request.getNickName(), request.getRole(), request.getCertification(), request.getCurrent(),
                request.getSize());
        PageResponse<UserInfo> response = new PageResponse<>();
        if (!queryResult.getSuccess()) {
            response.setSuccess(false);
            return response;
        }
        response.setSuccess(true);
        response.setData(userConverter.toInfos(queryResult.getData()));
        response.setCurrent(queryResult.getCurrent());
        response.setSize(queryResult.getSize());
        return response;

    }

    @Override
    public UserResponse freeze(Long userId) {
        // 1. 冻结用户
        userService.freeze(userId);
        // 2. 组装响应结果
        return UserResponse.success();
    }

    @Override
    public UserResponse unfreeze(Long userId) {
        // 1. 解冻用户
        userService.unfreeze(userId);
        // 2. 组装响应结果
        return UserResponse.success();
    }
}
