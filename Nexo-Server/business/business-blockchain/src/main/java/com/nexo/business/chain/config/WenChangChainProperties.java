package com.nexo.business.chain.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @classname WenChangChainConfiguration
 * @description 文昌链属性类
 * @date 2026/01/03 19:24
 */
@Component
@ConfigurationProperties(prefix = "chain.wenchang")
@Data
public class WenChangChainProperties {

    private String host;

    private String apiKey;

    private String apiSecret;

    private String chainAddrSuper;

}
