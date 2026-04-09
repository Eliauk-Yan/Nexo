package com.nexo.business.order.listener;

import com.alibaba.fastjson2.JSON;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.order.constant.TradeOrderEvent;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.OrderCancelRequest;
import com.nexo.common.api.order.request.OrderTimeoutRequest;
import com.nexo.common.api.order.request.OrderUpdateRequest;
import com.nexo.common.api.order.response.OrderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.producer.LocalTransactionState;
import org.apache.rocketmq.client.producer.TransactionListener;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.common.message.MessageExt;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderCloseTransactionListener implements TransactionListener {

    private final OrderService orderService;

    @Override
    public LocalTransactionState executeLocalTransaction(Message message, Object o) {
        try {
            // 1. 从消息中拿到参数 订单事件类型
            Map<String, String> headers = message.getProperties();
            String closeType = headers.get("CLOSE_TYPE");
            OrderResponse<Boolean> response = null;
            if (TradeOrderEvent.CANCEL.getCode().equals(closeType)) {
                // 2.主动关单
                // 2.1 解析消息
                OrderCancelRequest cancelRequest = JSON.parseObject(JSON.parseObject(message.getBody()).getString("body"), OrderCancelRequest.class);
                // 2.2 取消订单
                log.info("主动关单执行本地事务, 请求 = {} , 关单类型 = {}", JSON.toJSONString(cancelRequest), closeType);
                response = orderService.cancel(cancelRequest);
            } else if (TradeOrderEvent.TIME_OUT.getCode().equals(closeType)) {
                // 3. 超时关单
                OrderTimeoutRequest timeoutRequest = JSON.parseObject(JSON.parseObject(message.getBody()).getString("body"), OrderTimeoutRequest.class);
                log.info("超时关单执行本地事务, 请求 = {} , 关单类型 = {}", JSON.toJSONString(timeoutRequest), closeType);
                response = orderService.timeout(timeoutRequest);
            } else {
                throw new UnsupportedOperationException("不支持的关闭订单事件类型 " + closeType);
            }
            // 4. 判断本地事务状态
            if (response.getSuccess()) {
                // 4.1 本地事务提交
                return LocalTransactionState.COMMIT_MESSAGE;
            } else {
                // 4.2 本地事务回滚
                return LocalTransactionState.ROLLBACK_MESSAGE;
            }
        } catch (Exception e) {
            log.error("本地事务执行错误, 消息 = {}", message, e);
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }

    }

    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt messageExt) {
        // 1. 解析消息
        String closeType = messageExt.getProperties().get("CLOSE_TYPE");
        OrderUpdateRequest orderUpdateRequest = null;
        if (TradeOrderEvent.CANCEL.getCode().equals(closeType)) {
            orderUpdateRequest = JSON.parseObject(JSON.parseObject(new String(messageExt.getBody())).getString("body"), OrderCancelRequest.class);
        } else if (TradeOrderEvent.TIME_OUT.getCode().equals(closeType)) {
            orderUpdateRequest = JSON.parseObject(JSON.parseObject(new String(messageExt.getBody())).getString("body"), OrderTimeoutRequest.class);
        }
        assert orderUpdateRequest != null;
        // 2. 查询订单
        TradeOrder tradeOrder = orderService.getOrder(orderUpdateRequest.getOrderId(), null);
        // 3. 已关闭提交事务
        if (tradeOrder != null && tradeOrder.getOrderState() == TradeOrderState.CLOSED) {
            return LocalTransactionState.COMMIT_MESSAGE;
        }
        // 4. 为关闭回滚事务
        return LocalTransactionState.ROLLBACK_MESSAGE;
    }
}
