package com.nexo.business.user.service;

import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;

public interface UserAuthService {

    /**
     * 实名认证
     * @param dto 实名认证参数
     * @return 是否成功
     */
    boolean realNameAuth(RealNameAuthDTO dto);

}
