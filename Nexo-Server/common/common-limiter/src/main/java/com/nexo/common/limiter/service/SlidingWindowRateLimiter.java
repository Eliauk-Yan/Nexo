package com.nexo.common.limiter.service;

/**
 * 滑动窗口限流接口
 */
public interface SlidingWindowRateLimiter {

    /**
     * 尝试获取令牌
     * @param key 限流 key
     * @param limit 窗口大小内限制数量
     * @param size 窗口大小
     * @return 是否获取成功
     */
    public Boolean tryAcquire(String key, int limit, int size);

}
