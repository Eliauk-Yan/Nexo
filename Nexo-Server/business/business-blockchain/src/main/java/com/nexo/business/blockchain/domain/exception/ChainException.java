package com.nexo.business.blockchain.domain.exception;


import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

/**
 * @classname BlockchainException
 * @description TODO
 * @date 2025/12/25 16:24
 */
public class ChainException extends BusinessException {

    public ChainException(ErrorCode errorCode) {
        super(errorCode);
    }
}
