package com.nexo.common.file.config;

import com.nexo.common.file.service.MinioService;
import com.nexo.common.file.service.impl.MinioServiceImpl;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

/**
 * @classname FileConfiguration
 * @description 文件存储配置
 * @date 2025/12/12 10:45
 * @created by YanShijie
 */
@Slf4j
@AutoConfiguration
@EnableConfigurationProperties(FileProperties.class)
@ConditionalOnProperty(prefix = "minio", name = "enabled", havingValue = "true", matchIfMissing = true)
public class FileConfiguration {

    @Bean
    public MinioClient minioClient(FileProperties fileProperties) {
        try {
            MinioClient minioClient = MinioClient.builder()
                    .endpoint(fileProperties.getEndpoint())
                    .credentials(fileProperties.getAccessKey(), fileProperties.getSecretKey())
                    .build();

            // 检查并创建桶
            ensureBucketExists(minioClient, fileProperties);

            log.info("MinIO客户端初始化成功，桶: {}", fileProperties.getBucketName());
            return minioClient;
        } catch (Exception e) {
            log.error("MinIO客户端初始化失败", e);
            throw new RuntimeException("MinIO客户端初始化失败: " + e.getMessage(), e);
        }
    }

    /**
     * 暴露 MinioService Bean，供业务模块注入使用
     */
    @Bean
    @ConditionalOnMissingBean
    public MinioService minioService(MinioClient minioClient, FileProperties fileProperties) {
        return new MinioServiceImpl(minioClient, fileProperties);
    }

    /**
     * 确保桶存在，如果不存在则创建
     */
    private void ensureBucketExists(MinioClient minioClient, FileProperties fileProperties) {
        try {
            String bucketName = fileProperties.getBucketName();
            boolean found = minioClient.bucketExists(
                    io.minio.BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            if (!found) {
                minioClient.makeBucket(
                        io.minio.MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );
                log.info("桶创建成功: {}", bucketName);
            } else {
                log.debug("桶已存在: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("检查或创建桶失败: {}", fileProperties.getBucketName(), e);
            throw new RuntimeException("检查或创建桶失败: " + e.getMessage(), e);
        }
    }
}
