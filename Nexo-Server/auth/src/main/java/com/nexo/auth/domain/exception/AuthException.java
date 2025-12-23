package com.nexo.auth.domain.exception;

import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

/**
 * @classname AuthException
 * @description 认证模块异常
 * @date 2025/12/03 12:32
 * @created by YanShijie
 */
public class AuthException extends BusinessException {

    public AuthException(ErrorCode errorCode) {
        super(errorCode);
    }
}
