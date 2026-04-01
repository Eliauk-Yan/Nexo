package com.nexo.business.order.listener;

import com.alibaba.fastjson2.JSON;
import com.nexo.common.api.order.constant.TradeOrderEvent;
import com.nexo.common.api.order.request.OrderTimeoutRequest;
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

    @Override
    public LocalTransactionState executeLocalTransaction(Message message, Object o) {
        Map<String, String> headers = message.getProperties();
        String closeType = headers.get("CLOSE_TYPE");

        if (TradeOrderEvent.CANCEL.getCode().equals(closeType)) {
            // 订单取消
        } else if (TradeOrderEvent.TIME_OUT.getCode().equals(closeType)) {
            // 订单超时
            JSON.parseObject(JSON.parseObject(message.getBody()).getString("body"),
                    OrderTimeoutRequest.class);

        } else {
            throw new UnsupportedOperationException("不支持的关闭订单事件类型 " + closeType);
        }
        return null;
    }

    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt messageExt) {
        return null;
    }
}
