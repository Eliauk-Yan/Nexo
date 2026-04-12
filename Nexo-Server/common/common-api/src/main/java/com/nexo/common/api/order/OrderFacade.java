package com.nexo.common.api.order;

import com.nexo.common.api.order.request.*;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.order.response.data.OrderDTO;

/**
 * 订单模块Dubbo接口
 */

public interface OrderFacade {

    /**
     * 根据订单ID和用户ID获取订单
     */
    OrderResponse<OrderDTO> getOrder(String orderId, Long userId);

    /**
     * 创建并确认订单
     */
    OrderResponse<Boolean> createAndConfirm(OrderCreateAndConfirmRequest request);

    /**
     * 取消订单
     */
    OrderResponse<Boolean> cancel(OrderCancelRequest orderCancelRequest);

    /**
     * 订单超时
     */
    OrderResponse<?> timeout(OrderTimeoutRequest request);

    /**
     * 订单支付成功
     */
    OrderResponse<?> paySuccess(OrderPayRequest request);

    /**
     * 订单完成
     */
    OrderResponse<?> finish(OrderFinishRequest request);


}
