package com.nexo.common.sms.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @classname SmsProperties
 * @description 短信服务配置属性类
 * @date 2025/11/29 11:49
 * @created by YanShijie
 */
@ConfigurationProperties(prefix = "aliyun.sms")
@Data
public class SmsProperties {

    private String accessKeyId;

    private String accessKeySecret;

    private String regionId = "cn-beijing";

    private String endpoint = "dypnsapi.aliyuncs.com";

    private String signName;

    private String templateCode;

    /**
     * 检查必需配置是否完整
     */
    public boolean isConfigCompleted() {
        return accessKeyId != null && accessKeySecret != null
                && signName != null && templateCode != null;
    }

}
