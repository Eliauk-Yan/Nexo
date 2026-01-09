package com.nexo.auth.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum TokenErrorCode implements ErrorCode {

    TOKEN_KEY_ERROR("TOKEN_KEY_ERROR", "用户 KEY 错误");

    private final String code;

    private final String message;
}
