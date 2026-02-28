package com.nexo.admin.service;

import com.nexo.admin.domain.dto.UserQueryDTO;
import com.nexo.admin.domain.vo.UserVO;
import com.nexo.common.web.result.MultiResult;
import com.nexo.common.web.result.Result;
import jakarta.validation.Valid;

public interface UserService {

    /**
     * 获取用户列表
     * @param dto 查询参数
     * @return 用户列表
     */
    MultiResult<UserVO> getUserList(UserQueryDTO dto);

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
