package com.nexo.business.pay.api.config;

import com.apple.itunes.storekit.client.AppStoreServerAPIClient;
import com.apple.itunes.storekit.model.Environment;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Apple IAP 配置类。
 */
@Configuration
public class AppleIapConfiguration {

    /**
     * 创建 App Store Server API 官方客户端。
     */
    @Bean
    public AppStoreServerAPIClient appStoreServerAPIClient(AppleIapProperties properties, ResourceLoader resourceLoader
    ) throws Exception {
        return new AppStoreServerAPIClient(
                resolvePrivateKey(properties, resourceLoader),
                properties.getKeyId(),
                properties.getIssuerId(),
                properties.getBundleId(),
                resolveEnvironment(properties.getEnvironment())
        );
    }

    /**
     * 解析 Apple API 私钥内容。
     */
    private String resolvePrivateKey(AppleIapProperties properties, ResourceLoader resourceLoader) throws Exception {
        if (StringUtils.isNotBlank(properties.getPrivateKey())) {
            return properties.getPrivateKey();
        }
        Resource resource = resourceLoader.getResource(properties.getPrivateKeyLocation());
        if (!resource.exists()) {
            throw new IllegalStateException("Apple IAP 私钥文件不存在: " + properties.getPrivateKeyLocation());
        }
        try (InputStream inputStream = resource.getInputStream()) {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * 根据配置环境选择 Apple SDK 使用的 Environment 枚举。
     */
    private Environment resolveEnvironment(String environment) {
        if ("Production".equalsIgnoreCase(environment)) {
            return Environment.PRODUCTION;
        }
        return Environment.SANDBOX;
    }
}
