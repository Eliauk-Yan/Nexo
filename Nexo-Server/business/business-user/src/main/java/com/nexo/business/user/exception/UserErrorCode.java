package com.nexo.business.user.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname UserErrorCode
 * @description 用户模块错误码
 * @date 2025/12/02 09:11
 * @created by YanShijie
 */

@Getter
@AllArgsConstructor
public enum UserErrorCode implements ErrorCode {

    USER_NOT_EXIST("USER_NOT_EXIST", "用户不存在"),
    ;

    private final String code;

    private final String message;
}
