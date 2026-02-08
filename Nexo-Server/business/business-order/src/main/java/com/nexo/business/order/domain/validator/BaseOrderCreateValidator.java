package com.nexo.business.order.domain.validator;

import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.common.api.order.request.OrderCreateRequest;

/**
 * @classname BaseOrderCreateValidator
 * @description 订单创建校验器 模板方法设计
 * @date 2026/02/07 03:12
 */
public abstract class BaseOrderCreateValidator implements OrderCreateValidator {

    protected OrderCreateValidator nextValidator;

    @Override
    public void setNext(OrderCreateValidator nextValidator) {
        this.nextValidator = nextValidator;
    }

    @Override
    public OrderCreateValidator getNext() {
        return nextValidator;
    }

    @Override
    public void validate(OrderCreateRequest request) throws OrderException {
        doValidate(request);
        if (nextValidator != null) {
            nextValidator.validate(request);
        }
    }

    /**
     * 校验具体实现
     * @param request 请求
     * @throws OrderException 订单异常
     */
    protected abstract void doValidate(OrderCreateRequest request) throws OrderException;

}
