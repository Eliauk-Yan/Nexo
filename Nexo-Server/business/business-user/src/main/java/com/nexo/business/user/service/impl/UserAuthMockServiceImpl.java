package com.nexo.business.user.service.impl;

import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserAuthService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * @classname UserAuthMockServiceImpl
 * @description 用户认证服务模拟实现类
 * @date 2026/01/04 17:03
 */
@Service
@ConditionalOnProperty(prefix = "nexo.mock", name = "enable", havingValue = "true", matchIfMissing = true)
public class UserAuthMockServiceImpl implements UserAuthService {

    @Override
    public boolean realNameAuth(RealNameAuthDTO dto) {
        return true;
    }
}
