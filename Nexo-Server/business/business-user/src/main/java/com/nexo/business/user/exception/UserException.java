package com.nexo.business.user.exception;

import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

public class UserException extends BusinessException {

    public UserException(ErrorCode errorCode) {
        super(errorCode);
    }
}
