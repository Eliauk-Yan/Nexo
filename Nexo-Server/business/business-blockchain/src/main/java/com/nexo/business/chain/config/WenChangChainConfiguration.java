package com.nexo.business.chain.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @classname WenChangChainConfiguration
 * @description 文字链配置
 * @date 2026/01/03 19:24
 */
@Component
@Data
@ConfigurationProperties(prefix = "nexo.chain.wenchang")
public class WenChangChainConfiguration {

    private String host;

    private String apiKey;

    private String apiSecret;

    private String chainAddrSuper;

}
