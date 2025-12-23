package com.nexo.common.limiter.config;

import com.nexo.common.limiter.aspect.RateLimitAspect;
import com.nexo.common.limiter.service.SlidingWindowRateLimiter;
import com.nexo.common.limiter.service.impl.SlidingWindowRateLimiterImpl;
import org.redisson.api.RedissonClient;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

/**
 * @classname LimiterConfiguration
 * @description 限流配置
 * @date 2025/12/01 08:43
 * @created by YanShijie
 */
@AutoConfiguration
@ConditionalOnBean(RedissonClient.class)
public class LimiterConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public SlidingWindowRateLimiter slidingWindowRateLimiter(RedissonClient redissonClient) {
        return new SlidingWindowRateLimiterImpl(redissonClient);
    }

    @Bean
    @ConditionalOnMissingBean
    public RateLimitAspect rateLimitAspect(SlidingWindowRateLimiter slidingWindowRateLimiter) {
        return new RateLimitAspect(slidingWindowRateLimiter);
    }
}
