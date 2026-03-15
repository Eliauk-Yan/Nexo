package com.nexo.admin.service;

import com.nexo.admin.domain.param.UserQueryParam;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.web.result.MultiResult;
import jakarta.validation.Valid;

public interface UserService {

    /**
     * 获取当前登录管理员用户信息
     */
    UserInfo getUserInfo();

    /**
     * 获取用户列表
     * @param dto 查询参数
     * @return 用户列表
     */
    MultiResult<UserInfo> getUserList(UserQueryParam dto);

    /**
     * 冻结用户
     * @param userId 用户ID
     * @return 结果
     */
    Boolean freeze(@Valid Long userId);

    /**
     * 解冻用户
     * @param userId 用户ID
     * @return 结果
     */
    Boolean unfreeze(@Valid Long userId);
}
