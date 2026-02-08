package com.nexo.business.trade.domain.exception;

import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

/**
 * @classname TradeException
 * @description 交易模块异常类
 * @date 2026/02/08 17:03
 */
public class TradeException extends BusinessException {

    public TradeException(ErrorCode errorCode) {
        super(errorCode);
    }
}
