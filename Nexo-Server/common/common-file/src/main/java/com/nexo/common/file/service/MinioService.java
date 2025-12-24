package com.nexo.common.file.service;

import com.nexo.common.file.constant.enums.ServicePath;
import com.nexo.common.file.constant.enums.TypePath;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * @classname MinioService
 * @description MinIO 文件存储服务接口
 * @date 2025/12/12 10:52
 * @created by YanShijie
 */
public interface MinioService {

    /**
     * 上传文件
     *
     * @param file      文件
     * @param servicePath  文件路径
     * @param typePath  文件类型
     * @return 文件路径
     */
    String uploadFile(MultipartFile file, ServicePath servicePath, TypePath typePath);

    /**
     * 下载文件
     *
     * @param filePath 文件路径
     * @return 文件流
     */
    InputStream downloadFile(String filePath);

    /**
     * 删除文件
     *
     * @param filePath 文件路径
     */
    void deleteFile(String filePath);
}

