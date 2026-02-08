package com.nexo.business.order.domain.validator;

import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.common.api.order.request.OrderCreateRequest;

/**
 * @classname OrderCreateValidator
 * @description 订单创建校验器接口
 * @date 2026/02/07 03:06
 */
public interface OrderCreateValidator {

    /**
     * 设置下一个校验器
     * @param nextValidator 下一个校验器
     */
    public void setNext(OrderCreateValidator nextValidator);


    /**
     * 返回下一个校验器
     * @return 下一个校验器
     */
    public OrderCreateValidator getNext();


    /**
     * 校验
     * @param request 请求
     * @throws OrderException 订单异常
     */
    public void validate(OrderCreateRequest request) throws OrderException;

}
