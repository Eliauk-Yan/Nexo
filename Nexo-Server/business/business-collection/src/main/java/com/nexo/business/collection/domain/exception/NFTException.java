package com.nexo.business.collection.domain.exception;

import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

public class NFTException extends BusinessException {

    public NFTException(ErrorCode errorCode) {
        super(errorCode);
    }

}
