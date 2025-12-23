package com.nexo.common.file.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

/**
 * @classname MinioService
 * @description MinIO 文件存储服务接口
 * @date 2025/12/12 10:52
 * @created by YanShijie
 */
public interface MinioService {

    /**
     * 上传文件（指定路径）
     *
     * @param file     文件
     * @param filePath 文件路径（包含文件名）
     * @return 文件路径
     */
    String uploadFile(MultipartFile file, String filePath);

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

    /**
     * 批量删除文件
     *
     * @param filePaths 文件路径列表
     */
    void deleteFiles(List<String> filePaths);

    /**
     * 检查文件是否存在
     *
     * @param filePath 文件路径
     * @return 是否存在
     */
    boolean fileExists(String filePath);

    /**
     * 获取文件访问URL（公开访问）
     *
     * @param filePath 文件路径
     * @return 访问 URL
     */
    String getFileUrl(String filePath);

}

