package com.nexo.business.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.user.domain.entity.UserKyc;
import com.nexo.business.user.domain.exception.UserErrorCode;
import com.nexo.business.user.domain.exception.UserException;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.mapper.mybatis.UserKycMapper;
import com.nexo.business.user.service.UserAuthService;
import com.nexo.business.user.service.UserKycService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * @classname UserKycServiceImpl
 * @description 用户 KYC 服务实现类
 * @date 2025/12/29 20:36
 */
@Service
@RequiredArgsConstructor
public class UserKycServiceImpl extends ServiceImpl<UserKycMapper, UserKyc> implements UserKycService {

    private final UserAuthService userAuthService;

    @Override
    public Boolean realNameAuth(RealNameAuthDTO dto) {
        // 1. 调用用户认证服务
        if (!userAuthService.realNameAuth(dto)) {
            throw new UserException(UserErrorCode.REAL_NAME_AUTH_FAILED);
        }
        // 2. 获取用户ID
        long userId = StpUtil.getLoginIdAsLong();
        //  3. 保存用户 KYC 信息
        // TODO 数据加密
        UserKyc userKyc = new UserKyc();
        userKyc.setUserId(userId);
        userKyc.setRealName(dto.getRealName());
        userKyc.setIdCardNo(dto.getIdCardNo());
        // 4. 返回保存结果
        return this.save(userKyc);
    }
}
