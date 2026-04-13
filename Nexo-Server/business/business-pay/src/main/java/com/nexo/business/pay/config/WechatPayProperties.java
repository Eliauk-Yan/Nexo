package com.nexo.business.pay.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@ConfigurationProperties(prefix = "wechat.pay")
@Data
public class WechatPayProperties {

    private String appId;

    private String mchId;

    private String apiKey3;

    private String keyPath;

    private String platformCertPath;

    private String domain;

    public boolean isCallbackConfigReady() {
        return StringUtils.hasText(apiKey3) && StringUtils.hasText(platformCertPath);
    }

    public boolean isPayConfigReady() {
        return isCallbackConfigReady()
                && StringUtils.hasText(appId)
                && StringUtils.hasText(mchId)
                && StringUtils.hasText(keyPath)
                && StringUtils.hasText(domain);
    }
}
