package com.nexo.common.file.service.impl;

import com.nexo.common.file.config.FileProperties;
import com.nexo.common.file.exception.FileErrorCode;
import com.nexo.common.file.exception.FileException;
import com.nexo.common.file.service.MinioService;
import com.nexo.common.file.utils.FileUtils;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

/**
 * @classname MinioServiceImpl
 * @description MinIO 文件存储服务实现类
 * @date 2025/12/12 10:53
 * @created by YanShijie
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;

    private final FileProperties fileProperties;

    @Override
    public String uploadFile(MultipartFile file, String filePath) {
        try {
            // 验证文件类型
            String originalFilename = file.getOriginalFilename();
            String contentType = file.getContentType();
            if (!FileUtils.isAllowedFileType(originalFilename, contentType)) {
                throw new FileException(FileErrorCode.FILE_NOT_SUPPORTED);
            }
            // 上传文件
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                    .bucket(fileProperties.getBucketName())
                    .object(filePath)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(contentType)
                    .build();
            minioClient.putObject(putObjectArgs);
            log.info("文件上传成功: {}", filePath);
            return filePath;
        } catch (Exception e) {
            log.error("文件上传失败: {}", filePath, e);
            throw new FileException(FileErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public InputStream downloadFile(String filePath) {
        try {
            GetObjectArgs getObjectArgs = GetObjectArgs.builder()
                    .bucket(fileProperties.getBucketName())
                    .object(filePath)
                    .build();
            return minioClient.getObject(getObjectArgs);
        } catch (Exception e) {
            log.error("文件下载失败: {}", filePath, e);
            throw new FileException(FileErrorCode.FILE_DOWNLOAD_FAILED);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            RemoveObjectArgs removeObjectArgs = RemoveObjectArgs.builder()
                    .bucket(fileProperties.getBucketName())
                    .object(filePath)
                    .build();
            minioClient.removeObject(removeObjectArgs);
            log.info("文件删除成功: {}", filePath);
        } catch (Exception e) {
            log.error("文件删除失败: {}", filePath, e);
            throw new FileException(FileErrorCode.FILE_DELETE_FAILED);
        }
    }

    @Override
    public void deleteFiles(List<String> filePaths) {
        if (filePaths == null || filePaths.isEmpty()) {
            return;
        }
        filePaths.forEach(this::deleteFile);
    }

    @Override
    public boolean fileExists(String filePath) {
        try {
            StatObjectArgs statObjectArgs = StatObjectArgs.builder()
                    .bucket(fileProperties.getBucketName())
                    .object(filePath)
                    .build();

            minioClient.statObject(statObjectArgs);
            return true;
        } catch (ErrorResponseException e) {
            if (e.errorResponse().code().equals("NoSuchKey")) {
                return false;
            }
            log.error("检查文件是否存在失败: {}", filePath, e);
            throw new FileException(FileErrorCode.FILE_NOT_FOUND);
        } catch (Exception e) {
            log.error("检查文件是否存在失败: {}", filePath, e);
            throw new FileException(FileErrorCode.CHECK_FILE_EXIST_FAILED);
        }
    }

    @Override
    public String getFileUrl(String filePath) {
        String endpoint = fileProperties.getEndpoint();
        String bucketName = fileProperties.getBucketName();
        // 移除 endpoint 末尾的斜杠
        if (endpoint.endsWith("/")) {
            endpoint = endpoint.substring(0, endpoint.length() - 1);
        }
        // 确保 filePath 以斜杠开头
        if (!filePath.startsWith("/")) {
            filePath = "/" + filePath;
        }
        return endpoint + "/" + bucketName + filePath;
    }

}

