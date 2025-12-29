package com.nexo.business.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.user.domain.entity.UserKyc;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;

public interface UserKycService extends IService<UserKyc> {

    /**
     * 实名认证
     * @param dto 实名认证信息
     * @return 认证结果
     */
    Boolean realNameAuth(RealNameAuthDTO dto);
}
