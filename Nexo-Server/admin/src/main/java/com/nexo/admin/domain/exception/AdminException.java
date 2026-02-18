package com.nexo.admin.domain.exception;

import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

/**
 * 管理员模块异常
 */
public class AdminException extends BusinessException {

    public AdminException(ErrorCode errorCode) {
        super(errorCode);
    }
}
