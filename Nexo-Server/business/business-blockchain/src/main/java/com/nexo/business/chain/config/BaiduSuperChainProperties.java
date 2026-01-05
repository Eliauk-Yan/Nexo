package com.nexo.business.chain.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @classname BaiduSuperChainConfiguration
 * @description 百度超级链配置类
 * @date 2026/01/05 16:43
 */
@Data
@Component
@ConfigurationProperties(prefix = "nexo.chain.baidu")
public class BaiduSuperChainProperties {

    private long appId = 110973;

    private String ak = "b96b7a6634a8ef1f20e5de3d92ced17f";

    private String sk = "a4d3346d7343e7b411680a6507199702";

}
