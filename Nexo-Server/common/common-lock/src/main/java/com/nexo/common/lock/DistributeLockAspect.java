package com.nexo.common.lock;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.core.StandardReflectionParameterNameDiscoverer;
import org.springframework.core.annotation.Order;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

/**
 * 分布式锁切面
 */
@Aspect
@Component
@Order(Integer.MIN_VALUE + 1)
@Slf4j
public class DistributeLockAspect {

    private final RedissonClient redissonClient;

    public DistributeLockAspect(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    @Around("@annotation(com.nexo.common.lock.DistributeLock)")
    public Object process(ProceedingJoinPoint pjp) throws Exception {

        Object response = null;

        // 1. 从当前切入点里拿到方法的对象
        Method method = ((MethodSignature) pjp.getSignature()).getMethod();
        // 2. 获取方法上的注解
        DistributeLock distributeLock = method.getAnnotation(DistributeLock.class);
        // 3. 读取注解里面写死的key
        String key = distributeLock.key();
        // 4. 没有写死key读SPEL表达式
        if (DistributeLockConstant.NONE_KEY.equals(key)) {
            // 5. 如果没有keySPEL表达式报错
            if (DistributeLockConstant.NONE_KEY.equals(distributeLock.keyExpression())) {
                throw new DistributeLockException("锁的 key 没有找到...");
            }
            // 6. 创建SPEL表达式解析器 解析表达式
            SpelExpressionParser parser = new SpelExpressionParser();
            // 7. 解析为SPEL表达式对象
            Expression expression = parser.parseExpression(distributeLock.keyExpression());
            // 8. 创建表达式上下文
            EvaluationContext context = new StandardEvaluationContext();
            // 9. 获取参数值
            Object[] args = pjp.getArgs();
            // 10. 创建参数名发现器，用于获取方法参数名
            StandardReflectionParameterNameDiscoverer discoverer = new StandardReflectionParameterNameDiscoverer();
            // 11. 获取方法的参数名数组
            String[] parameterNames = discoverer.getParameterNames(method);
            // 12. 将参数绑定到context中
            if (parameterNames != null) {
                for (int i = 0; i < parameterNames.length; i++) {
                    context.setVariable(parameterNames[i], args[i]);
                }
            }
            // 13. 解析表达式，获取结果
            key = String.valueOf(expression.getValue(context));
        }
        // 14. 获取锁的场景
        String scene = distributeLock.scene();
        // 15. 拼接分布式锁的key
        String lockKey = scene + "#" + key;
        // 16. 读取锁的过期时间
        int expireTime = distributeLock.expireTime();
        // 17. 读取等等获取锁的时间
        int waitTime = distributeLock.waitTime();
        // 18. 获取锁对象
        RLock rLock= redissonClient.getLock(lockKey);
        try {
            // 记录是否加锁成功
            boolean lockResult = false;
            // 等待时间如果等于默认值直接加速不等待
            if (waitTime == DistributeLockConstant.DEFAULT_WAIT_TIME) {
                // 如果锁过期时间等于默认值 不加过期时间直接上锁
                if (expireTime == DistributeLockConstant.DEFAULT_EXPIRE_TIME) {
                    log.info("锁 key : {}", lockKey);
                    rLock.lock();
                } else {
                    log.info("锁 key : {} , 过期时间 : {}", lockKey, expireTime);
                    rLock.lock(expireTime, TimeUnit.MILLISECONDS);
                }
                lockResult = true;
            } else {
                if (expireTime == DistributeLockConstant.DEFAULT_EXPIRE_TIME) {
                    log.info("尝试上锁 key : {} , 等待时间 : {}", lockKey, waitTime);
                    lockResult = rLock.tryLock(waitTime, TimeUnit.MILLISECONDS);
                } else {
                    log.info("尝试上锁 key : {} , 过期时间 : {} , 等待时间 : {}", lockKey, expireTime, waitTime);
                    lockResult = rLock.tryLock(waitTime, expireTime, TimeUnit.MILLISECONDS);
                }
            }
            if (!lockResult) {
                log.warn("加锁失败 key : {} , 过期时间 : {}", lockKey, expireTime);
                throw new DistributeLockException("加锁失败... : " + lockKey);
            }
            log.info("加速成功 key : {} , 过期时间 : {}", lockKey, expireTime);
            // 执行被拦截的方法
            response = pjp.proceed();
        } catch (Throwable e) {
            throw new Exception(e);
        } finally {
            // 如果当前线持有这把锁 防止锁已过期或锁根本没加成功时误 unlock
            if (rLock.isHeldByCurrentThread()) {
                rLock.unlock();
                log.info("释放锁 key : {} , 过期时间 : {}", lockKey, expireTime);
            }
        }
        return response;
    }
}
