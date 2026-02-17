package com.nexo.common.web.filter;

import com.nexo.common.web.utils.TokenUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.io.IOException;

/**
 * @classname TokenFilter
 * @description Token 认证过滤器
 * @date 2026/01/09 17:10
 */
@Slf4j
@RequiredArgsConstructor
public class TokenFilter implements Filter {

    private final StringRedisTemplate stringRedisTemplate;

    // 线程本地变量
    public static final ThreadLocal<String> tokenThreadLocal = new ThreadLocal<>();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        try {
            // 1. 获取请求响应信息
            HttpServletRequest request = (HttpServletRequest) servletRequest;
            HttpServletResponse response = (HttpServletResponse) servletResponse;
            // 2. 获取请求头中的 token
            String token = request.getHeader("Authorization");

            if (StringUtils.isBlank(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("没有找到token...");
                log.error("没有在请求头中找到 token, 请检查！");
                return;
            }

            // 3. 验证 token
            boolean isValid = checkTokenValid(token);

            if (!isValid) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("token 无效或超时");
                log.error("token验证失败，请检查！");
                return;
            }
            // 4. 放行
            filterChain.doFilter(servletRequest, servletResponse);
        } finally {
            tokenThreadLocal.remove();
        }
    }

    private boolean checkTokenValid(String token) {
        // 1. 解密加密的token，并转为key
        token = TokenUtil.getTokenKeyByValue(token);
        // 2. 从 redis 中获取 value
        String value = stringRedisTemplate.opsForValue().getAndDelete(token);
        // 3. 设置到线程本地变量中（创建订单会用到）
        tokenThreadLocal.set(value);
        // 4. 返回结果
        return value != null;
    }
}
