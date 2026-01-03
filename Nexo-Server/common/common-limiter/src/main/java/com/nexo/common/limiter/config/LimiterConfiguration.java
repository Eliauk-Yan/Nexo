package com.nexo.common.limiter.config;

import com.nexo.common.limiter.aspect.RateLimitAspect;
import org.redisson.api.RedissonClient;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;

/**
 * @classname LimiterConfiguration
 * @description 限流配置
 * @date 2025/12/01 08:43
 * @created by YanShijie
 */
@AutoConfiguration
public class LimiterConfiguration {

    @Bean
    public RateLimitAspect rateLimitAspect(RedissonClient redissonClient) {
        return new RateLimitAspect(redissonClient);
    }
}
