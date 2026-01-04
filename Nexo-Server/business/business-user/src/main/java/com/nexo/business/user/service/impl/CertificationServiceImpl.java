package com.nexo.business.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.user.domain.entity.Account;
import com.nexo.business.user.domain.entity.Certification;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.domain.exception.UserErrorCode;
import com.nexo.business.user.domain.exception.UserException;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.mapper.mybatis.CertificationMapper;
import com.nexo.business.user.service.AccountService;
import com.nexo.business.user.service.CertificationService;
import com.nexo.business.user.service.UserAuthService;
import com.nexo.business.user.service.UserService;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.api.user.constant.UserState;
import com.nexo.common.base.constant.CommonConstant;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @classname UserKycServiceImpl
 * @description 用户 KYC 服务实现类
 * @date 2025/12/29 20:36
 */
@Service
@RequiredArgsConstructor
public class CertificationServiceImpl extends ServiceImpl<CertificationMapper, Certification> implements CertificationService {

    private final UserAuthService userAuthService;

    private final UserService userService;

    private final AccountService accountService;


    @DubboReference(version = "1.0.0")
    private final ChainFacade chainFacade;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean realNameAuth(RealNameAuthDTO dto) {
        // 1. 调用用户认证服务
        if (!userAuthService.realNameAuth(dto)) {
            throw new UserException(UserErrorCode.REAL_NAME_AUTH_FAILED);
        }
        // 2. 获取用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 3. 保存用户实名认证信息
        Certification certification = new Certification();
        certification.setUserId(userId);
        certification.setRealName(dto.getRealName());
        certification.setIdCardNo(dto.getIdCardNo());
        boolean authResult = this.save(certification);
        // 4. 实名认证成功后创建链账户
        if (authResult) {
            // 创建链账户请求
            ChainRequest chainRequest = new ChainRequest();
            chainRequest.setUserId(String.valueOf(userId));
            String identifier = CommonConstant.APP_NAME + CommonConstant.SEPARATOR + userId;
            chainRequest.setIdentifier(identifier);
            ChainResponse<ChainCreateData> chainAccount = chainFacade.createChainAccount(chainRequest);
            if (chainAccount.getSuccess()) {
                // 保存链账户信息
                ChainCreateData responseData = chainAccount.getData();
                Account account = new Account();
                account.setUserId(userId);
                account.setAddress(responseData.getAccount());
                account.setPlatform(responseData.getPlatform());
                accountService.save(account);
                // 更新用户状态
                User currentUser = userService.getById(userId);
                currentUser.setState(UserState.ACTIVE);
                return userService.updateById(currentUser);
            } else {
                throw new UserException(UserErrorCode.USER_CREATE_CHAIN_FAIL);
            }
        }
        return false;
    }
}
