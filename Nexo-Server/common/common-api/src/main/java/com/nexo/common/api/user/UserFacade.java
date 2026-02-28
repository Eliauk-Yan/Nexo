package com.nexo.common.api.user;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.common.api.user.request.UserListQueryRequest;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.UserRegisterRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
import com.nexo.common.api.user.response.data.UserDTO;
import com.nexo.common.api.user.response.data.UserInfo;

public interface UserFacade {

    /**
     * 用户查询对外接口
     *
     * @param request 查询请求
     * @return 查询结果
     */
    UserQueryResponse<UserInfo> userQuery(UserQueryRequest request);

    /**
     * 用户注册对外接口
     *
     * @param request 请求
     * @return 响应
     */
    UserResponse register(UserRegisterRequest request);

    /**
     * 获取用户列表
     *
     * @param request 查询请求
     * @return 响应
     */
    UserQueryResponse<Page<UserDTO>> getUserList(UserListQueryRequest request);

    /**
     * 用户冻结
     *
     * @param userId 用户ID
     * @return 响应
     */
    UserResponse freeze(Long userId);

    /**
     * 用户解冻
     *
     * @param userId 用户ID
     * @return 响应
     */
    UserResponse unfreeze(Long userId);
}
