package com.nexo.business.order.domain.exception;

import com.nexo.common.base.exception.BusinessException;
import com.nexo.common.base.exception.code.ErrorCode;

/**
 * @classname OrderException
 * @description 订单模块异常类
 * @date 2026/02/07 03:08
 */
public class OrderException extends BusinessException {

    public OrderException(ErrorCode errorCode) {
        super(errorCode);
    }

}
