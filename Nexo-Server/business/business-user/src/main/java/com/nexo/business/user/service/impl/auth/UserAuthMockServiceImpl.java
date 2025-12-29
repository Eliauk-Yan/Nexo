package com.nexo.business.user.service.impl.auth;

import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserAuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * @classname UserAuthMockServiceImpl
 * @description TODO
 * @date 2025/12/29 20:24
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "nexo.mock.enable", havingValue = "true")
public class UserAuthMockServiceImpl implements UserAuthService {

    @Override
    public boolean realNameAuth(RealNameAuthDTO dto) {
        log.info("用户实名认证成功");
        return true;
    }
}
