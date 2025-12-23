package com.nexo.common.file.utils;

import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * @classname FileUtils
 * @description 文件工具类
 * @date 2025/12/12 10:55
 * @created by YanShijie
 */
public class FileUtils {

    /**
     * 允许的文件扩展名
     */
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            // 图片
            "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg",
            // 文档
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt",
            // 压缩文件
            "zip", "rar", "7z", "tar", "gz",
            // 视频
            "mp4", "avi", "mov", "wmv", "flv", "mkv",
            // 音频
            "mp3", "wav", "flac", "aac",
            // 其他
            "json", "xml", "csv"
    );

    /**
     * 允许的 MIME 类型
     */
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            // 图片
            "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/svg+xml",
            // 文档
            "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            // 压缩文件
            "application/zip", "application/x-rar-compressed", "application/x-7z-compressed",
            "application/x-tar", "application/gzip",
            // 视频
            "video/mp4", "video/x-msvideo", "video/quicktime", "video/x-ms-wmv", "video/x-flv", "video/x-matroska",
            // 音频
            "audio/mpeg", "audio/wav", "audio/flac", "audio/aac",
            // 其他
            "application/json", "application/xml", "text/csv"
    );

    /**
     * 生成文件路径（包含日期目录）
     *
     * @param originalFilename 原始文件名
     * @return 文件路径
     */
    public static String generateFilePath(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            throw new IllegalArgumentException("文件名不能为空");
        }

        // 获取文件扩展名
        String extension = getFileExtension(originalFilename);
        // 生成唯一文件名
        String uniqueFileName = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        // 生成日期目录
        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        // 组合路径
        return dateDir + "/" + uniqueFileName;
    }

    /**
     * 获取文件扩展名
     *
     * @param filename 文件名
     * @return 扩展名（小写，不包含点）
     */
    public static String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    /**
     * 验证文件类型是否允许
     *
     * @param filename    文件名
     * @param contentType MIME 类型
     * @return 是否允许
     */
    public static boolean isAllowedFileType(String filename, String contentType) {
        if (!StringUtils.hasText(filename)) {
            return false;
        }
        // 检查扩展名
        String extension = getFileExtension(filename);
        if (StringUtils.hasText(extension) && ALLOWED_EXTENSIONS.contains(extension)) {
            return true;
        }

        // 检查MIME类型
        if (StringUtils.hasText(contentType) && ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            return true;
        }

        return false;
    }

    /**
     * 获取文件大小（格式化显示）
     *
     * @param size 文件大小（字节）
     * @return 格式化后的文件大小
     */
    public static String formatFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.2f KB", size / 1024.0);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", size / (1024.0 * 1024.0));
        } else {
            return String.format("%.2f GB", size / (1024.0 * 1024.0 * 1024.0));
        }
    }

    /**
     * 验证文件大小
     *
     * @param size        文件大小（字节）
     * @param maxSizeInMB 最大大小（MB）
     * @return 是否有效
     */
    public static boolean isValidFileSize(long size, long maxSizeInMB) {
        long maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        return size > 0 && size <= maxSizeInBytes;
    }
}




