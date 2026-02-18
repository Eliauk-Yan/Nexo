package com.nexo.admin.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum AdminErrorCode implements ErrorCode {

    ADMIN_NOT_FOUND("ADMIN_NOT_FOUND", "管理员不存在");

    private final String code;

    private final String message;
}
