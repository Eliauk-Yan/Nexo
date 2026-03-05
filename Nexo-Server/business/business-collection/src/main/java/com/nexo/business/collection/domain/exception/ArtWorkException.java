package com.nexo.business.collection.domain.exception;

import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

public class ArtWorkException extends BusinessException {

    public ArtWorkException(ErrorCode errorCode) {
        super(errorCode);
    }

}
