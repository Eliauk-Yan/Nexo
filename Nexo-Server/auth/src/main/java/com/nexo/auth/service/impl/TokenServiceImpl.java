package com.nexo.auth.service.impl;

import com.nexo.auth.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * @classname TokenServiceImpl
 * @description TODO
 * @date 2026/01/08 23:04
 */
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final StringRedisTemplate redisTemplate;

    @Override
    public String getToken(String scene, String id) {

        return "";
    }
}
