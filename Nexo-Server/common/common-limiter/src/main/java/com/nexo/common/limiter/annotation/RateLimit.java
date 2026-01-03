package com.nexo.common.limiter.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @classname RateLimit
 * @description 限流注解
 * @date 2025/12/01
 * @created by YanShijie
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

    /**
     * 限流key，直接使用字符串
     */
    String key();

    /**
     * 窗口大小内限制数量
     */
    int limit();

    /**
     * 窗口大小（秒）
     */
    int windowSize();

    /**
     * 限流时的提示消息
     */
    String message() default "请求过于频繁，请稍后再试";
}

