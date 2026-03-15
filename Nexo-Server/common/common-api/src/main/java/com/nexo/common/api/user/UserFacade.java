package com.nexo.common.api.user;

import com.nexo.common.api.user.request.UserPageQueryRequest;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.UserRegisterRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.base.response.PageResponse;

public interface UserFacade {


    /**
     * 用户查询
     */
    UserQueryResponse<UserInfo> userQuery(UserQueryRequest request);

    /**
     * 用户注册
     */
    UserResponse register(UserRegisterRequest request);

    /**
     * 获取用户列表
     */
    PageResponse<UserInfo> pageQuery(UserPageQueryRequest request);

    /**
     * 用户冻结
     */
    UserResponse freeze(Long userId);

    /**
     * 用户解冻
     */
    UserResponse unfreeze(Long userId);
}
