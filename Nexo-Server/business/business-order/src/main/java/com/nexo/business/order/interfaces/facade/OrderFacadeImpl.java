package com.nexo.business.order.interfaces.facade;

import com.alibaba.fastjson.JSON;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.business.order.domain.validator.OrderCreateValidator;
import com.nexo.business.order.mapper.convert.OrderConvertor;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.request.NFTSaleRequest;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.order.request.*;
import com.nexo.common.base.response.ResponseCode;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.order.response.data.OrderDTO;
import com.nexo.common.lock.DistributeLock;
import com.nexo.common.mq.producer.StreamProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;

import java.util.Objects;

import static com.nexo.business.order.domain.exception.OrderErrorCode.ORDER_CREATE_VALID_FAILED;
import static com.nexo.business.order.domain.exception.OrderErrorCode.ORDER_ALREADY_CLOSED;
import static com.nexo.business.order.domain.exception.OrderErrorCode.ORDER_ALREADY_PAID;

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

    /**
     * 下单校验责任链
     */
    private final OrderCreateValidator orderCreateValidator;

    /**
     * 藏品接口
     */
    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;


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

    @DistributeLock(keyExpression = "#request.identifier", scene = "ORDER_CREATE")
    @Override
    public OrderResponse<Boolean> createAndConfirm(OrderCreateAndConfirmRequest request) {
        // 1. 创建订单前校验
        OrderResponse<Boolean> orderResponse = new OrderResponse<>();
        try {
            orderCreateValidator.validate(request);
        } catch (Exception e) {
            // 前置校验失败，记录日志并退出，不再继续执行
            log.error("订单校验失败, orderId={}, 原因={}", request.getOrderId(), e.getMessage(), e);
            orderResponse.setSuccess(false);
            orderResponse.setCode(ORDER_CREATE_VALID_FAILED.getCode());
            orderResponse.setMessage(ORDER_CREATE_VALID_FAILED.getMessage());
            return orderResponse;
        }
        // 2. 构造扣减库存请求
        NFTSaleRequest saleRequest = new NFTSaleRequest();
        saleRequest.setUserId(request.getBuyerId());
        saleRequest.setQuantity(request.getItemCount());
        saleRequest.setBizNo(request.getOrderId());
        saleRequest.setNftType(request.getNftType());
        saleRequest.setIdentifier(request.getIdentifier());
        saleRequest.setNFTId(Long.parseLong(request.getProductId())); // 设置商品ID
        NFTResponse<Boolean> nftResponse = nftFacade.sale(saleRequest);
        if (!nftResponse.getSuccess()) {
            orderResponse.setSuccess(false);
            orderResponse.setCode(nftResponse.getCode());
            orderResponse.setMessage(nftResponse.getMessage());
            return orderResponse;
        }
        return orderService.createAndConfirm(request);
    }

    @Override
    public OrderResponse<Boolean> cancel(OrderCancelRequest request) {
        // 1. 发送关单事务消息 Rocket事务消息 因为RocketMQ 的事务消息中，如果本地事务发生了异常，这里返回也会是个 true，所以就需要做一下反查进行二次判断，才能知道关单操作是否成功
        streamProducer.send("orderClose-out-0", null, JSON.toJSONString(request), "CLOSE_TYPE", request.getOrderEvent().getCode());
        TradeOrder tradeOrder = orderService.getOrder(request.getOrderId(), null);
        OrderResponse<Boolean> orderResponse = new OrderResponse<>();
        orderResponse.setSuccess(tradeOrder != null && tradeOrder.getOrderState() == TradeOrderState.CLOSED);
        return orderResponse;
    }


    @Override
    public OrderResponse<?> timeout(OrderTimeoutRequest request) {
        streamProducer.send("orderClose-out-0", null, JSON.toJSONString(request), "CLOSE_TYPE", request.getOrderEvent().getCode());
        TradeOrder order = orderService.getOrder(request.getOrderId(), null);
        OrderResponse<?> orderResponse = new OrderResponse<>();
        orderResponse.setSuccess(order != null && order.getOrderState() == TradeOrderState.CLOSED);
        return orderResponse;
    }


    @Override
    public OrderResponse<?> paySuccess(OrderPayRequest request) {
        try {
            return orderService.paySuccess(request);
        } catch (OrderException e) {
            TradeOrder order = orderService.getOrder(request.getOrderId(), null);
            OrderResponse<Object> response = new OrderResponse<>();
            response.setOrderId(request.getOrderId());
            if (order != null && order.getOrderState() == TradeOrderState.CLOSED) {
                response.setSuccess(false);
                response.setCode(ORDER_ALREADY_CLOSED.getCode());
                response.setMessage(ORDER_ALREADY_CLOSED.getMessage());
                return response;
            }
            if (order != null && order.getOrderState() == TradeOrderState.PAID) {
                if (Objects.equals(order.getPaymentStreamId(), request.getPaymentStreamId())
                        && Objects.equals(order.getPaymentMethod(), request.getPaymentMethod().getCode())) {
                    response.setSuccess(true);
                    response.setCode(ResponseCode.DUPLICATED.getCode());
                    response.setMessage(ResponseCode.DUPLICATED.getMessage());
                    return response;
                }
                response.setSuccess(false);
                response.setCode(ORDER_ALREADY_PAID.getCode());
                response.setMessage(ORDER_ALREADY_PAID.getMessage());
                return response;
            }
            throw e;
        }
    }

    @Override
    public OrderResponse<?> finish(OrderFinishRequest request) {
        return orderService.finish(request);
    }
}
