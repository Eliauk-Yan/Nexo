package com.nexo.common.api.order;

import com.nexo.common.api.order.request.OrderPayRequest;
import com.nexo.common.api.order.request.OrderFinishRequest;
import com.nexo.common.api.order.request.OrderTimeoutRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.order.response.data.OrderDTO;

/**
 * 订单模块Dubbo接口
 */

public interface OrderFacade {

    /**
     * 根据订单ID和用户ID获取订单
     * 
     * @param orderId 订单ID
     * @param userId  用户ID
     * @return 订单信息
     */
    OrderResponse<OrderDTO> getOrder(String orderId, Long userId);

    /**
     * 订单超时
     * 
     * @param request 订单超时请求
     * @return 响应
     */
    OrderResponse<?> timeout(OrderTimeoutRequest request);

    /**
     * 订单支付成功
     * 
     * @param request 订单支付请求
     * @return 响应
     */
    OrderResponse<?> paySuccess(OrderPayRequest request);

    /**
     * 订单完成
     *
     * @param request 订单完成请求
     * @return 响应
     */
    OrderResponse<?> finish(OrderFinishRequest request);

}
