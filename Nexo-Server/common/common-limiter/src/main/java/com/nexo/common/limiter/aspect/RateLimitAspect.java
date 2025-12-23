package com.nexo.common.limiter.aspect;

import com.nexo.common.limiter.annotation.RateLimit;
import com.nexo.common.limiter.exception.LimiterException;
import com.nexo.common.limiter.service.SlidingWindowRateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

/**
 * @classname RateLimitAspect
 * @description 限流切面
 * @date 2025/12/01
 * @created by YanShijie
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitAspect {

    private final SlidingWindowRateLimiter slidingWindowRateLimiter;

    private final ExpressionParser parser = new SpelExpressionParser();

    @Around("@annotation(com.nexo.common.limiter.annotation.RateLimit)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        // 1. 解析限流注解属性
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RateLimit annotation = signature.getMethod().getAnnotation(RateLimit.class);

        // 支持 SpEL 解析 key
        StandardEvaluationContext context = new StandardEvaluationContext();
        context.setVariable("args", joinPoint.getArgs()); // 可以访问方法参数
        String key = parser.parseExpression(annotation.key()).getValue(context, String.class);

        int limit = annotation.limit();
        int windowSize = annotation.windowSize();
        String message = annotation.message();

        // 2. 校验属性
        if (limit <= 0 || windowSize <= 0) {
            throw new IllegalArgumentException("Invalid RateLimit parameters");
        }

        // 3. 尝试获取令牌
        boolean access = slidingWindowRateLimiter.tryAcquire(key, limit, windowSize);

        // 4. 限流触发
        if (!access) {
            log.warn("{}，key: {}, limit: {}, windowSize: {}", message, key, limit, windowSize);
            throw new LimiterException(message); // 强制限流，抛出异常
        }

        // 5. 执行原方法
        return joinPoint.proceed();
    }
}