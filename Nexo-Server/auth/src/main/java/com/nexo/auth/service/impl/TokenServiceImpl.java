package com.nexo.auth.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.auth.domain.exception.AuthErrorCode;
import com.nexo.auth.domain.exception.AuthException;
import com.nexo.auth.interfaces.dto.TokenDTO;
import com.nexo.auth.service.TokenService;
import com.nexo.common.web.utils.TokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

import static com.nexo.common.cache.constant.CacheConstant.CACHE_KEY_SEPARATOR;
import static com.nexo.common.web.utils.TokenUtil.TOKEN_PREFIX;

/**
 * @classname TokenServiceImpl
 * @description Token 服务实现类
 * @date 2026/01/08 23:04
 */
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final StringRedisTemplate redisTemplate;

    @Override
    public String getToken(TokenDTO tokenDTO) {
        // 1. 校验参数
        if (tokenDTO.getScene() == null || tokenDTO.getKey() == null) {
            throw new AuthException(AuthErrorCode.TOKEN_KEY_ERROR);
        }
        // 3. 校验用户是否登录
        if (StpUtil.isLogin()) {
            // 4. 获取用户信息
            String userId = StpUtil.getLoginIdAsString();
            // 5. 拼接 token key
            String tokenKey = TOKEN_PREFIX + tokenDTO.getScene() +  CACHE_KEY_SEPARATOR + userId + CACHE_KEY_SEPARATOR + tokenDTO.getKey();
            // 6. 获取 token value
            String tokenValue = TokenUtil.getTokenValueByKey(tokenKey);
            // 7. 设置 token 到 redis
            redisTemplate.opsForValue().set(tokenKey, tokenValue, 30, TimeUnit.MINUTES);
            return tokenValue;
        }
        throw new AuthException(AuthErrorCode.USER_NOT_LOGIN);
    }
}
