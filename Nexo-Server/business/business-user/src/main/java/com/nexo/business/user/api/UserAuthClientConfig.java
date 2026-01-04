package com.nexo.business.user.api;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

/**
 * @classname UserAuthClientConfig
 * @description 用户认证 HTTP 客户端
 * @date 2026/01/04 14:39
 */
@Configuration
@RequiredArgsConstructor
public class UserAuthClientConfig {

    @Value("${nexo.auth.real-name.host}")
    private String host;

    @Value("${nexo.auth.real-name.appcode}")
    private String appcode;

    @Bean
    public RestClient userAuthClient() {
        return RestClient.builder()
                .baseUrl(host)
                .defaultHeader("Authorization", "APPCODE " + appcode)
                .build();
    }

    // ✅ 注册 HTTP Interface 代理（UserAuthApi Bean）
    @Bean
    public UserAuthApi userAuthApi(RestClient userAuthClient) {
        HttpServiceProxyFactory factory = HttpServiceProxyFactory
                .builderFor(RestClientAdapter.create(userAuthClient))
                .build();
        return factory.createClient(UserAuthApi.class);
    }
}
