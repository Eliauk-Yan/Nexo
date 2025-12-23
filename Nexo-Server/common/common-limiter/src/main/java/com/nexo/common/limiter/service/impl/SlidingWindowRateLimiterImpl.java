package com.nexo.common.limiter.service.impl;

import com.nexo.common.limiter.service.SlidingWindowRateLimiter;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateType;
import org.redisson.api.RedissonClient;

import java.time.Duration;

import static com.nexo.common.limiter.constant.LimiterConstant.LIMIT_KEY_PREFIX;

/**
 * @classname TokenBucketRateLimiterImpl
 * @description 令牌桶限流实现
 * @date 2025/12/01 08:44
 * @created by YanShijie
 */
@RequiredArgsConstructor
public class SlidingWindowRateLimiterImpl implements SlidingWindowRateLimiter {

    private final RedissonClient redissonClient;

    @Override
    public Boolean tryAcquire(String key, int limit, int size) {
        // 1. 获取限流器
        RRateLimiter rRateLimiter = redissonClient.getRateLimiter(LIMIT_KEY_PREFIX + key);
        // 2. 判断限流器是否存在
        if (!rRateLimiter.isExists()) {
            // 3. 不存在则创建
            rRateLimiter.trySetRate(RateType.OVERALL, limit, Duration.ofSeconds(size));
        }
        // 4. 尝试获取令牌
        return rRateLimiter.tryAcquire();
    }
}
