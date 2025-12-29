package com.nexo.business.user.service.impl.auth;

import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserAuthService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * @classname UserAuthServiceImpl
 * @description TODO
 * @date 2025/12/29 20:23
 */
@Service
@ConditionalOnProperty(name = "nexo.mock.enable", havingValue = "false" , matchIfMissing = true)
public class UserAuthServiceImpl implements UserAuthService {

    @Override
    public boolean realNameAuth(RealNameAuthDTO dto) {
        // TODO 接入真实 API
        return false;
    }

}
