package com.nexo.business.user.service.impl;

import cn.hutool.http.HttpRequest;
import com.alibaba.fastjson2.JSON;
import com.nexo.business.user.api.response.RealNameAuthResponse;
import com.nexo.business.user.domain.exception.UserErrorCode;
import com.nexo.business.user.domain.exception.UserException;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * @classname UserAuthServiceImpl
 * @description 用户认证服务实现类
 * @date 2026/01/04 15:10
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "nexo.mock", name = "enable", havingValue = "false")
public class UserAuthServiceImpl implements UserAuthService {

    @Override
    public boolean realNameAuth(RealNameAuthDTO dto) {
        String url = "https://kzidcardv1.market.alicloudapi.com/api-mall/api/id_card/check";
        // 1. 构建请求
        HttpRequest request = HttpRequest.post(url)
                .header("Authorization", "APPCODE 65b1e4df85b5405d92fb427d6e44d452")
                .header("Content-Type", "application/x-www-form-urlencoded");
        // 2. 表单参数
        request.form("name", dto.getRealName());
        request.form("idcard", dto.getIdCardNo());
        // 3. 发送请求
        String responseJson = request.execute().body();
        RealNameAuthResponse resp = JSON.parseObject(responseJson, RealNameAuthResponse.class);
        if (!resp.getSuccess()) {
            throw new UserException(UserErrorCode.REAL_NAME_AUTH_SERVICE_ERROR);
        }
        return resp.getCode() == 200;
    }
}
