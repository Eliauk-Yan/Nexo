package com.nexo.business.chain.config;

import com.nexo.business.chain.api.WenChangAPI;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

/**
 * @classname WenChangChainConfiguration
 * @description 文昌链配置类
 * @date 2026/01/04 20:13
 */
@Configuration
@EnableConfigurationProperties(WenChangChainProperties.class)
public class WenChangChainConfiguration {

    @Bean
    public RestClient userAuthClient(WenChangChainProperties properties) {
        // FIXME 待完善
        return RestClient.builder()
                .baseUrl(properties.getHost())
                .defaultHeader("X-Api-Key", properties.getApiKey())
                // .requestInterceptor(((request, body, execution) -> {
                //
                // }))
                .build();
    }

    // 注册 HTTP Interface 代理
    @Bean
    public WenChangAPI wenChangAPI(RestClient wenChangClient) {
        HttpServiceProxyFactory factory = HttpServiceProxyFactory
                .builderFor(RestClientAdapter.create(wenChangClient))
                .build();
        return factory.createClient(WenChangAPI.class);
    }

}
