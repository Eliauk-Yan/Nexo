package com.nexo.common.api.order;

import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.order.response.OrderResponse;

/**
 * 订单模块Dubbo接口
 */

public interface OrderFacade {

    OrderResponse createOrder(OrderCreateRequest request);

}
