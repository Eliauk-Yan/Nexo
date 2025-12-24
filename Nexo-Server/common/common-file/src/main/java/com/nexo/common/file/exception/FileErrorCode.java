package com.nexo.common.file.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname FileErrorCode
 * @description 文件存储异常码
 * @date 2025/12/12 11:21
 * @created by YanShijie
 */
@AllArgsConstructor
@Getter
public enum FileErrorCode implements ErrorCode {

    FILE_NOT_FOUND("FILE_NOT_FOUND", "文件不存在"),

    FILE_UPLOAD_FAILED("FILE_UPLOAD_FAILED", "文件上传失败"),

    FILE_DOWNLOAD_FAILED("FILE_DOWNLOAD_FAILED", "文件下载失败"),

    FILE_DELETE_FAILED("FILE_DELETE_FAILED", "文件删除失败"),

    FILE_NOT_SUPPORTED("FILE_NOT_SUPPORTED", "文件格式不支持"),

    FILE_COPY_FAILED("FILE_COPY_FAILED", "文件复制失败"),

    FILE_NOT_NULL("FILE_NOT_NULL", "文件不能为空"),

    FILE_NAME_NOT_NULL("FILE_NAMW_NOT_NULL", "文件名不能为空"),

    CHECK_FILE_EXIST_FAILED("CHECK_FILE_EXIST_FAILED", "检查文件是否存在失败"),

    GET_PRE_SIGN_URL_FAILED("GET_PRE_SIGN_URL_FAILED", "获取预签名'URL'失败");

    private final String code;

    private final String message;
}
