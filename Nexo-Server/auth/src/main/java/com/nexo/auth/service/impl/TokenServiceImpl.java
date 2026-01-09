package com.nexo.auth.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.auth.domain.exception.AuthErrorCode;
import com.nexo.auth.domain.exception.AuthException;
import com.nexo.auth.service.TokenService;
import com.nexo.auth.utils.TokenUtils;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.ArtWorkResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDetailData;
import com.nexo.common.cache.constant.CacheConstant;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * @classname TokenServiceImpl
 * @description Token 服务实现类
 * @date 2026/01/08 23:04
 */
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final StringRedisTemplate redisTemplate;

    @DubboReference(version = "1.0.0")
    private ArtWorkFacade artWorkFacade;

    @Override
    public String getToken(Long key) {
        // 1. 查询藏品信息
        ArtWorkResponse<ArtWorkDetailData> response = artWorkFacade.getArtWork(key);
        // 2. 校验藏品信息
        Optional.ofNullable(response.getData())
                .orElseThrow(() -> new AuthException(AuthErrorCode.TOKEN_KEY_ERROR));
        // 3. 校验用户是否登录
        if (StpUtil.isLogin()) {
            // 4. 获取用户信息
            String userId = StpUtil.getLoginIdAsString();
            // 5. 拼接 token key
            String tokenKey = TokenUtils.TOKEN_PREFIX + CacheConstant.CACHE_KEY_SEPARATOR + userId + CacheConstant.CACHE_KEY_SEPARATOR + key;
            // 6. 获取 token value
            String tokenValue = TokenUtils.getTokenValueByKey(tokenKey);
            // 7. 设置 token 到 redis
            redisTemplate.opsForValue().set(tokenKey, tokenValue, 30, TimeUnit.MINUTES);
            return tokenValue;
        }
        throw new AuthException(AuthErrorCode.USER_NOT_LOGIN);
    }
}
