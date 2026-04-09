package com.nexo.business.pay.exception;


import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

public class PayException  extends BusinessException {

    public PayException(ErrorCode errorCode) {
        super(errorCode);
    }
}
