package com.nexo.common.limiter.exception;

import com.nexo.common.base.exception.BusinessException;

public class LimiterException extends BusinessException {

    public LimiterException(String message) {
        super(message);
    }
}
