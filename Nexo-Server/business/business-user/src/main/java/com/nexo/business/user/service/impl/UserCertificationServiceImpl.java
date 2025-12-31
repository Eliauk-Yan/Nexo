package com.nexo.business.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.user.domain.entity.Certification;
import com.nexo.business.user.domain.exception.UserErrorCode;
import com.nexo.business.user.domain.exception.UserException;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.mapper.mybatis.UserCertificationMapper;
import com.nexo.business.user.service.UserAuthService;
import com.nexo.business.user.service.UserCertificationService;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.request.ChainRequest;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;

/**
 * @classname UserKycServiceImpl
 * @description 用户 KYC 服务实现类
 * @date 2025/12/29 20:36
 */
@Service
@RequiredArgsConstructor
public class UserCertificationServiceImpl extends ServiceImpl<UserCertificationMapper, Certification> implements UserCertificationService {

    private final UserAuthService userAuthService;

    @DubboReference(version = "1.0.0")
    private final ChainFacade chainFacade;

    @Override
    public Boolean realNameAuth(RealNameAuthDTO dto) {
        // 1. 调用用户认证服务
        if (!userAuthService.realNameAuth(dto)) {
            throw new UserException(UserErrorCode.REAL_NAME_AUTH_FAILED);
        }
        // 2. 获取用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 3. 保存用户实名认证信息
        // TODO 数据加密
        Certification certification = new Certification();
        certification.setUserId(userId);
        certification.setRealName(dto.getRealName());
        certification.setIdCardNo(dto.getIdCardNo());
        boolean authResult = this.save(certification);
        // 4. 实名认证成功后创建链账户
        if (authResult) {
            ChainRequest chainRequest = new ChainRequest();
            // chainRequest.setIdentifier();
            // chainFacade.onChain()
        }
        return true;
    }
}
