package com.nexo.common.api.user;

import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.UserRegisterRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
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
    UserQueryResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.nexo.common.api.user.response.data.UserDTO>> getUserList(
            com.nexo.common.api.user.request.UserListQueryRequest request);

    /**
     * 添加用户
     * 
     * @param userDTO 用户信息
     * @return 响应
     */
    Boolean addUser(com.nexo.common.api.user.response.data.UserDTO userDTO);

    /**
     * 修改用户
     * 
     * @param userDTO 用户信息
     * @return 响应
     */
    Boolean updateUser(com.nexo.common.api.user.response.data.UserDTO userDTO);

    /**
     * 删除用户
     * 
     * @param id 用户ID
     * @return 响应
     */
    Boolean deleteUser(Long id);

}
