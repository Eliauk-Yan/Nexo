package com.nexo.business.pay.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Apple App Store Server API 配置。
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "nexo.iap.apple")
public class AppleIapProperties {

    /**
     * App Bundle ID。
     */
    private String bundleId;

    /**
     * App Store Connect API Issuer ID。
     */
    private String issuerId;

    /**
     * App Store Connect API Key ID。
     */
    private String keyId;

    /**
     * App Store Connect API .p8 私钥内容。
     */
    private String privateKey;

    /**
     * App Store Connect API .p8 私钥文件位置。
     */
    private String privateKeyLocation;

    /**
     * Sandbox 或 Production。
     */
    private String environment = "Sandbox";
}
