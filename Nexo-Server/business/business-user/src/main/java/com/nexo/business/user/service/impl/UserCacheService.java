package com.nexo.business.user.service.impl;

import com.alicp.jetcache.anno.CacheRefresh;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.anno.Cached;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.mapper.mybatis.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * @classname UserCacheService
 * @description 用户模块缓存服务
 * @date 2026/03/01 02:05
 */
@RequiredArgsConstructor
@Service
public class UserCacheService {

    private final UserMapper userMapper;

    @Cached(name = ":user:cache:id:", cacheType = CacheType.BOTH, key = "#userId", cacheNullValue = true)
    @CacheRefresh(refresh = 60, timeUnit = TimeUnit.MINUTES) // 每60分钟刷新
    public User getUserById(Long userId) {
        return userMapper.selectById(userId);
    }

}
