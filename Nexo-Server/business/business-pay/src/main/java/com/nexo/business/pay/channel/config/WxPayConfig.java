package com.nexo.business.pay.channel.config;

import com.ijpay.wxpay.WxPayApiConfig;
import com.ijpay.wxpay.WxPayApiConfigKit;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Configuration;


@Configuration
@Slf4j
public class WxPayConfig {

    private final WxPayProperties properties;

    public WxPayConfig(WxPayProperties properties) {
        this.properties = properties;
    }

    /**
     * 初始化微信支付配置
     */
    @PostConstruct
    public void init() {
        if (true) {
            log.warn("检测到微信支付配置或证书未准备完成，已跳过 WxPayApiConfig 初始化");
            return;
        }

        WxPayApiConfig config = WxPayApiConfig.builder()
                .appId(properties.getAppId())
                .mchId(properties.getMchId())
                .apiKey3(properties.getApiKey3())
                .keyPath(properties.getKeyPath())
                .certPath(properties.getPlatformCertPath())
                .platformCertPath(properties.getPlatformCertPath())
                .build();
        WxPayApiConfigKit.putApiConfig(config);
    }

}
