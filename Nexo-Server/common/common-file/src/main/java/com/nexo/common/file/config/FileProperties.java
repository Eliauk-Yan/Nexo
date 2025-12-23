package com.nexo.common.file.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @classname FileProperties
 * @description 文件存储配置属性类
 * @date 2025/12/12 10:46
 * @created by YanShijie
 */
@Data
@ConfigurationProperties(prefix = "minio")
public class FileProperties {

    /**
     * 是否启用MinIO（默认启用）
     */
    private boolean enabled = true;

    /**
     * MinIO 服务端点
     */
    private String endpoint;

    /**
     * 访问密钥
     */
    private String accessKey;

    /**
     * 密钥
     */
    private String secretKey;

    /**
     * 桶名称（默认：nexo-dev）
     */
    private String bucketName = "nexo-dev";

    /**
     * 是否使用HTTPS（默认：false）
     */
    private boolean secure = false;

    /**
     * 预签名链接有效期（小时，默认：24）
     */
    private int presignedExpiryHours = 24;

    /**
     * 临时文件有效期（天，默认：7）
     */
    private int tempDays = 7;

    /**
     * 最大文件大小（MB，默认：100）
     */
    private long maxFileSizeMB = 100;

    /**
     * 是否自动创建桶（默认：true）
     */
    private boolean autoCreateBucket = true;

}
