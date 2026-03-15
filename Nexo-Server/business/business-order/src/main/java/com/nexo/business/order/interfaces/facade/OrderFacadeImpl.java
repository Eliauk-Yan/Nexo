package com.nexo.business.order.interfaces.facade;

import com.alibaba.fastjson.JSON;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.mapper.convert.OrderConvertor;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.base.response.ResponseCode;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.OrderPayRequest;
import com.nexo.common.api.order.request.OrderTimeoutRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.order.response.data.OrderDTO;
import com.nexo.common.mq.producer.StreamProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * @classname OrderFacadeImpl
 * @description 订单模块Dubbo接口实现类
 * @date 2026/02/06 01:56
 */
@RequiredArgsConstructor
@DubboService(version = "1.0.0")
@Slf4j
public class OrderFacadeImpl implements OrderFacade {

    /**
     * 订单服务
     */
    private final OrderService orderService;

    /**
     * 订单转换器
     */
    private final OrderConvertor orderConvertor;

    /**
     * 消息生产者
     */
    private final StreamProducer streamProducer;

    @Override
    public OrderResponse<OrderDTO> getOrder(String orderId, Long userId) {
        // 1. 获取订单信息
        TradeOrder order = orderService.getOrder(orderId, userId);
        // 2. 转换DTO
        OrderDTO dto = orderConvertor.toDTO(order);
        // 3. 构造响应对象并返回
        OrderResponse<OrderDTO> response = new OrderResponse<>();
        response.setData(dto);
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.getCode());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        return response;
    }

    @Override
    public OrderResponse<?> timeout(OrderTimeoutRequest request) {
        streamProducer.send("orderClose-out-0", null, JSON.toJSONString(request), "CLOSE_TYPE",
                request.getOrderEvent().getCode());
        TradeOrder order = orderService.getById(request.getOrderId());
        OrderResponse<?> orderResponse = new OrderResponse<>();
        orderResponse.setSuccess(order.getOrderState() == TradeOrderState.CLOSED);
        return orderResponse;
    }

    @Override
    public OrderResponse<?> paySuccess(OrderPayRequest request) {
        OrderResponse<?> response = new OrderResponse<>();
        try {
            boolean result = orderService.paySuccess(request);
            response.setSuccess(result);
            if (result) {
                response.setCode(ResponseCode.SUCCESS.getCode());
                response.setMessage(ResponseCode.SUCCESS.getMessage());
            } else {
                response.setCode("PAY_SUCCESS_FAILED");
                response.setMessage("订单支付推进失败");
            }
        } catch (Exception e) {
            log.error("订单支付推进异常, orderId={}", request.getOrderId(), e);
            response.setSuccess(false);
            response.setCode("PAY_SUCCESS_ERROR");
            response.setMessage("订单支付推进异常: " + e.getMessage());
        }
        return response;
    }
}
