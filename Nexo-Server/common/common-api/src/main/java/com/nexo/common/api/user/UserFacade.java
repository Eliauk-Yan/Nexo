package com.nexo.common.api.user;

import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.UserRegisterRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
import com.nexo.common.api.user.response.data.UserInfo;

public interface UserFacade {

    /**
     * 用户查询对外接口
     * @param request 查询请求
     * @return 查询结果
     */
    UserQueryResponse<UserInfo> userQuery(UserQueryRequest request);

    /**
     * 用户注册对外接口
     * @param request 请求
     * @return 响应
     */
    UserResponse register(UserRegisterRequest request);

}
