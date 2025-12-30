package com.nexo.business.user.interceptor;

import com.github.houbb.sensitive.core.api.SensitiveUtil;
import com.nexo.business.user.interfaces.vo.UserProfileVO;
import com.nexo.common.web.result.Result;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * Spring MVC 提供的一个处理类，允许在返回 JSON 给客户端之前，统一修改响应数据。
 * @classname SensitiveResponseBodyAdvice
 * @description 敏感数据统一脱敏
 * @date 2025/12/30 17:33
 */
@ControllerAdvice
public class DesensitizedResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    /**
     * 判断是否支持
     * @param returnType 方法返回值类型
     * @param converterType 转换器类型
     * @return true/false
     */
    @Override
    public boolean supports(@NonNull MethodParameter returnType, @NonNull Class<? extends HttpMessageConverter<?>> converterType) {
        // 1.如果返回类型是Result或子类，则进行数据脱敏
        return Result.class.isAssignableFrom(returnType.getParameterType());
    }

    /**
     * 响应数据处理
     * @param body 响应数据
     * @param returnType 方法返回值类型
     * @param selectedContentType 响应内容类型
     * @param selectedConverterType 转换器类型
     * @param request 请求
     * @param response 响应
     * @return 处理后的响应数据
     */
    @Override
    public @Nullable Object beforeBodyWrite(@Nullable Object body, @NonNull MethodParameter returnType, @NonNull MediaType selectedContentType, @NonNull Class<? extends HttpMessageConverter<?>> selectedConverterType, @NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response) {
        if (body instanceof Result<?> && ((Result<?>) body).getData() instanceof UserProfileVO) {
            Result<UserProfileVO> result = (Result<UserProfileVO>) body;
            UserProfileVO data = result.getData();
            UserProfileVO sensitive = SensitiveUtil.desCopy(data);
            result.setData(sensitive);
            return result;
        }
        return body;
    }
}
