package com.nexo.business.user.service.impl;

import com.nexo.business.user.api.UserAuthApi;
import com.nexo.business.user.api.response.RealNameAuthResponse;
import com.nexo.business.user.domain.exception.UserErrorCode;
import com.nexo.business.user.domain.exception.UserException;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

/**
 * @classname UserAuthServiceImpl
 * @description 用户认证服务实现类
 * @date 2026/01/04 15:10
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "nexo.mock", name = "enable", havingValue = "false", matchIfMissing = false)
public class UserAuthServiceImpl implements UserAuthService {

    private final UserAuthApi userAuthApi;

    @Override
    public boolean realNameAuth(RealNameAuthDTO dto) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("name", dto.getRealName());
        form.add("idcard", dto.getIdCardNo());
        RealNameAuthResponse resp = userAuthApi.realNameAuth(form);
        if (!resp.getSuccess()) {
            throw new UserException(UserErrorCode.REAL_NAME_AUTH_SERVICE_ERROR);
        }
        return resp.getCode() == 200;
    }
}
