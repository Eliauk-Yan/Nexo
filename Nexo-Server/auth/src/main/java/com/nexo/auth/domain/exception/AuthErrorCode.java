package com.nexo.auth.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum AuthErrorCode implements ErrorCode {

    VERIFY_CODE_ERROR("VERIFY_CODE_ERROR", "验证码错误"),

    USER_NOT_EXIST("USER_NOT_EXIST", "用户不存在"),

    USER_REGISTER_FAILED("USER_REGISTER_FAILED", "用户注册失败"),

    USER_EXIST("USER_EXIST", "用户已存在"),

    TOKEN_KEY_ERROR("TOKEN_KEY_ERROR", "TOKEN KEY 错误"),

    USER_NOT_LOGIN("USER_NOT_LOGIN", "用户未登录");

    private final String code;

    private final String message;
}
