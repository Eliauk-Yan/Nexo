package com.nexo.business.order.interfaces.facade;

import com.nexo.business.order.domain.validator.OrderCreateValidator;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.order.response.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * @classname OrderFacadeImpl
 * @description 订单模块Dubbo接口实现类
 * @date 2026/02/06 01:56
 */
@RequiredArgsConstructor
@DubboService(version = "1.0.0")
public class OrderFacadeImpl implements OrderFacade {

    private final OrderService orderService;

    private final OrderCreateValidator orderCreateValidator;

    @Override
    public OrderResponse createOrder(OrderCreateRequest request) {
        // 1. 校验参数
        orderCreateValidator.validate(request);
        // 2. 库存预扣减

        // 3. 创建订单并异步确认

        return null;
    }
}
