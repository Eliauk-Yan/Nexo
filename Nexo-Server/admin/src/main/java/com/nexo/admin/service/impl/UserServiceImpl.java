package com.nexo.admin.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.admin.domain.param.UserQueryParam;
import com.nexo.admin.domain.exception.AdminException;
import com.nexo.admin.service.UserService;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.request.UserPageQueryRequest;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.base.response.PageResponse;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;

import static com.nexo.admin.domain.exception.AdminErrorCode.ADMIN_NOT_FOUND;
import static com.nexo.admin.domain.exception.AdminErrorCode.GET_USER_FAILED;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    @DubboReference(version = "1.0.0")
    private UserFacade userFacade;

    @Override
    public UserInfo getUserInfo() {
        // 1. 构造用户查询请求
        UserQueryRequest request = new UserQueryRequest();
        request.setId(StpUtil.getLoginIdAsLong());
        UserQueryResponse<UserInfo> response = userFacade.userQuery(request);
        UserInfo userInfo = response.getData();
        if (userInfo == null || userInfo.getRole() != UserRole.ADMIN) {
            throw new AdminException(ADMIN_NOT_FOUND);
        }
        return userInfo;
    }

    @Override
    public MultiResult<UserInfo> getUserList(UserQueryParam dto) {
        // 1. 构造分页查询请求
        UserPageQueryRequest request = new UserPageQueryRequest();
        request.setCurrent(dto.getCurrent());
        request.setSize(dto.getSize());
        request.setState(dto.getState());
        request.setKeyword(dto.getPhone());
        request.setNickName(dto.getNickName());
        request.setRole(dto.getRole());
        request.setCertification(dto.getCertification());
        // 2. 调用用户服务进行查询
        PageResponse<UserInfo> response = userFacade.pageQuery(request);
        if (!response.getSuccess() && response.getData() == null) {
            throw new AdminException(GET_USER_FAILED);
        }
        // 3. 返回数据
        return MultiResult.multiSuccess(response.getData(), response.getTotal(), response.getCurrent(), response.getSize());
    }

    @Override
    public Boolean freeze(Long userId) {
        // 1. 验证当前操作用户是否是管理员
        verifyAdmin();
        // 2. 冻结用户
        UserResponse response = userFacade.freeze(userId);
        // 3. 重新查出用户信息，更新登录的session，确保用户权限实时更新
        refreshUserInSession(userId);
        // 4. 返回结果
        return response.getSuccess();
    }

    @Override
    public Boolean unfreeze(Long userId) {
        // 1. 验证当前操作用户是否是管理员
        verifyAdmin();
        // 2. 冻结用户
        UserResponse response = userFacade.unfreeze(userId);
        // 3. 重新查出用户信息，更新登录的session，确保用户权限实时更新
        refreshUserInSession(userId);
        // 4. 返回结果
        return response.getSuccess();
    }

    /**
     * 刷新用户信息到session
     * 
     * @param userId 用户ID
     */
    private void refreshUserInSession(Long userId) {
        UserQueryRequest request = new UserQueryRequest();
        request.setId(userId);
        UserQueryResponse<UserInfo> userQueryResponse = userFacade.userQuery(request);
        StpUtil.getSessionByLoginId(userId).set("userInfo", userQueryResponse.getData());
    }

    /**
     * 验证当前操作用户是否是管理员
     */
    private void verifyAdmin() {
        // 1. 查询管理员
        long adminId = StpUtil.getLoginIdAsLong();
        UserQueryRequest adminQueryRequest = new UserQueryRequest();
        adminQueryRequest.setId(adminId);
        UserQueryResponse<UserInfo> adminQueryResponse = userFacade.userQuery(adminQueryRequest);
        UserInfo userInfo = adminQueryResponse.getData();
        // 2. 用户不存在或者不是管理员用户
        if (userInfo == null || userInfo.getRole() != UserRole.ADMIN) {
            throw new AdminException(ADMIN_NOT_FOUND);
        }
    }
}
