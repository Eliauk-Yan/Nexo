package com.nexo.common.file.service.impl;

import com.nexo.common.file.config.FileProperties;
import com.nexo.common.file.constant.enums.ServicePath;
import com.nexo.common.file.constant.enums.TypePath;
import com.nexo.common.file.exception.FileErrorCode;
import com.nexo.common.file.exception.FileException;
import com.nexo.common.file.service.MinioService;
import com.nexo.common.file.utils.FileUtils;
import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * @classname MinioServiceImpl
 * @description MinIO 文件存储服务实现类
 * @date 2025/12/12 10:53
 * @created by YanShijie
 */
@Slf4j
@RequiredArgsConstructor
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;

    private final FileProperties fileProperties;

    @Override
    public String uploadFile(MultipartFile file, ServicePath servicePath, TypePath typePath) {
        try {
            // 1. 拼接文件路径
            String filePath = FileUtils.concatFilePath(servicePath, typePath, file.getOriginalFilename());
            // 2. 上传文件
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                    .bucket(fileProperties.getBucketName())
                    .object(filePath)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build();
            minioClient.putObject(putObjectArgs);
            log.info("文件上传成功: {}", file.getOriginalFilename());
            // 3. 返回文件路径
            return getFileUrl(filePath);
        } catch (Exception e) {
            log.error("文件上传失败: {}", file.getOriginalFilename(), e);
            throw new FileException(FileErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public void deleteFile(String fileURL) {
        try {
            // 1. 获取文件路径
            String filePath = getFilePath(fileURL);
            // 2. 检查文件是否存在
            checkFileExist(filePath);
            // 3. 创建删除文件参数
            RemoveObjectArgs removeObjectArgs = RemoveObjectArgs.builder()
                    .bucket(fileProperties.getBucketName())
                    .object(filePath)
                    .build();
            // 4. 删除文件
            minioClient.removeObject(removeObjectArgs);
            log.info("文件删除成功: {}", fileURL);
        } catch (Exception e) {
            log.error("文件删除失败: {}", fileURL, e);
            throw new FileException(FileErrorCode.FILE_DELETE_FAILED);
        }
    }

    @Override
    public InputStream downloadFile(String fileURL) {
        try {
            // 1. 获取文件路径
            String filePath = getFilePath(fileURL);
            // 2. 检查文件是否存在
            checkFileExist(filePath);
            // 3. 创建下载文件参数
            GetObjectArgs getObjectArgs = GetObjectArgs.builder()
                    .bucket(fileProperties.getBucketName())
                    .object(fileURL)
                    .build();
            return minioClient.getObject(getObjectArgs);
        } catch (Exception e) {
            log.error("文件下载失败: {}", fileURL, e);
            throw new FileException(FileErrorCode.FILE_DOWNLOAD_FAILED);
        }
    }

    /**
     * 检查文件是否存在
     * @param filePath 文件路径
     */
    private void checkFileExist(String filePath) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(fileProperties.getBucketName())
                            .object(filePath)
                            .build()
            );
        } catch (Exception e) {
            log.error("检查文件是否存在失败: {}", filePath, e);
            throw new FileException(FileErrorCode.CHECK_FILE_EXIST_FAILED);
        }
    }

    /**
     * 获取文件 URL
     * @param filePath 文件路径
     * @return 文件 URL
     */
    private String getFileUrl(String filePath) {
        String endpoint = fileProperties.getEndpoint();
        String bucketName = fileProperties.getBucketName();
        return endpoint + "/" + bucketName + "/" + filePath;
    }

    /**
     * 获取文件路径
     * @param fileURL 文件 URL
     * @return 文件路径
     */
    private String getFilePath(String fileURL) {
        String endpoint = fileProperties.getEndpoint();
        String bucketName = fileProperties.getBucketName();
        return fileURL.replace(endpoint + "/" + bucketName + "/", "");
    }

}

