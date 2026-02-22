package com.nexo.admin.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum AdminErrorCode implements ErrorCode {

    ADMIN_UPLOAD_IMAGE_FAILED("ADMIN_UPLOAD_IMAGE_FAILED", "后台上传图片失败"),

    GET_NFT_FAILED("GET_NFT_FAILED", "获取藏品数据失败"),

    ADMIN_NOT_FOUND("ADMIN_NOT_FOUND", "管理员不存在");

    private final String code;

    private final String message;
}
