package com.nexo.business.pay.channel.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 微信支付配置类
 */
@Data
@Component
@ConfigurationProperties(prefix = "wxpay")
public class WxPayProperties {

    /**
     * 应用ID
     */
    private String appId;

    /**
     * 商户号
     */
    private String mchId;

    /**
     * APIv3密钥
     */
    private String apiKey3;

    /**
     * 商户 API 证书序列号
     */
    private String serialNo;

    /**
     * API证书路径
     */
    private String keyPath;

    /**
     * API证书路径
     */
    private String platformCertPath;

    /**
     * 回调地址
     */
    private String notifyUrl;

}
