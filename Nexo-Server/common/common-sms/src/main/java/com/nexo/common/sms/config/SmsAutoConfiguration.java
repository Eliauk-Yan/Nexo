package com.nexo.common.sms.config;

import com.aliyun.sdk.service.dypnsapi20170525.AsyncClient;
import com.nexo.common.sms.SmsService;
import com.nexo.common.sms.impl.SmsServiceImpl;
import darabonba.core.client.ClientOverrideConfiguration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

/**
 * @classname SmsConfiguration
 * @description 短信服务配置类
 * @date 2025/11/29 11:49
 * @created by YanShijie
 */
@Slf4j
@AutoConfiguration
@EnableConfigurationProperties(SmsProperties.class)
public class SmsAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public AsyncClient asyncClient(SmsProperties properties) {
        return AsyncClient.builder()
                .region(properties.getRegionId())
                .credentialsProvider(com.aliyun.auth.credentials.provider.StaticCredentialProvider.create(
                        com.aliyun.auth.credentials.Credential.builder()
                                .accessKeyId(properties.getAccessKeyId())
                                .accessKeySecret(properties.getAccessKeySecret())
                                .build()))
                .overrideConfiguration(
                        ClientOverrideConfiguration.create()
                                .setEndpointOverride(properties.getEndpoint())
                                .setConnectTimeout(java.time.Duration.ofSeconds(3))
                )
                .build();
    }

    @Bean
    @ConditionalOnMissingBean
    public SmsService smsService(AsyncClient asyncClient, SmsProperties properties) {
        if (!properties.isConfigCompleted()) {
            log.warn("短信功能未完整配置（accessKey/signName/templateCode），已自动禁用");
            throw new RuntimeException("短信功能未完整配置（accessKey/signName/templateCode），已自动禁用");
        }
        log.info("短信功能已启用，签名={}，模板={}", properties.getSignName(), properties.getTemplateCode());
        return new SmsServiceImpl(asyncClient, properties);
    }

}
