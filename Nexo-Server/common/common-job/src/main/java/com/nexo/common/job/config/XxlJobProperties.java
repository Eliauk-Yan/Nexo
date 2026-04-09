package com.nexo.common.job.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * XXL-JOB 配置属性类
 */
@Setter
@Getter
@ConfigurationProperties(prefix = XxlJobProperties.PREFIX)
public class XxlJobProperties {

    /**
     * 配置前缀
     */
    public static final String PREFIX = "spring.xxl.job";

    /**
     * 是否启用 XXL-JOB
     */
    private boolean enabled;

    /**
     * 调度中心地址
     */
    private String adminAddresses;

    /**
     * 访问令牌（安全校验）
     * 与 XXL-JOB admin 配置保持一致
     */
    private String accessToken;

    /**
     * 执行器名称
     * 对应 XXL-JOB 控制台中的 AppName
     */
    private String appName;

    /**
     * 执行器 IP
     */
    private String ip;

    /**
     * 执行器端口
     * 默认为 9999 或随机
     */
    private int port;

    /**
     * 日志存储路径
     */
    private String logPath;

    /**
     * 日志保留天数
     * 超过天数自动清理
     * 默认 30 天
     */
    private int logRetentionDays = 30;

}