package com.nexo.admin.service;

import com.nexo.admin.domain.dto.LoginDTO;
import com.nexo.admin.domain.vo.LoginVO;
import jakarta.validation.Valid;

public interface AuthService {

    /**
     * 管理员登录
     * @param params 登录参数
     * @return 登录信息
     */
    LoginVO login(@Valid LoginDTO params);
}
