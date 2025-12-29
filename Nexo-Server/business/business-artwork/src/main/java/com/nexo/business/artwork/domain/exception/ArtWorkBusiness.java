package com.nexo.business.artwork.domain.exception;

import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

public class ArtWorkBusiness extends BusinessException {

    public ArtWorkBusiness(ErrorCode errorCode) {
        super(errorCode);
    }

}
