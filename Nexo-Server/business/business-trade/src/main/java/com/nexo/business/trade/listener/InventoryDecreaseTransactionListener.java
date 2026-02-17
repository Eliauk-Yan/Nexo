package com.nexo.business.trade.listener;

import com.alibaba.fastjson2.JSON;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.mq.message.MessageBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.producer.LocalTransactionState;
import org.apache.rocketmq.client.producer.TransactionListener;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.common.message.MessageExt;
import org.springframework.stereotype.Component;

/**
 * @classname InventoryDecreaseListener
 * @description 库存扣减MQ本地事务 只有库存扣减成功才可以创建订单否则库存回滚 保证数据一直性
 * @date 2026/02/13 23:11
 */
@Component("inventoryDecreaseTransactionListener")
@Slf4j
@RequiredArgsConstructor
public class InventoryDecreaseTransactionListener implements TransactionListener {

    private final InventoryFacade inventoryFacade;

    /**
     * 生产者发送消息成功后调用
     * 
     * @param message 消息
     * @param o       参数
     * @return 消息结果状态枚举
     */
    @Override
    public LocalTransactionState executeLocalTransaction(Message message, Object o) {
        try {
            // 1. 获取业务参数
            String businessKey = o != null ? o.toString() : "";
            log.info("开始执行本地事务，业务 Key: {}", businessKey);
            // 2. 解析消息
            String jsonString = new String(message.getBody());
            // 首先解析为 MessageBody
            MessageBody messageBody = JSON.parseObject(jsonString, MessageBody.class);
            // 从 MessageBody 中获取真正的业务请求 String 并解析
            OrderCreateRequest request = JSON.parseObject(messageBody.getBody(), OrderCreateRequest.class);

            // 2. 扣减库存
            InventoryResponse<Boolean> response = inventoryFacade.decreaseInventory(request);
            if (response.getSuccess() && response.getData()) {
                log.info("本地事务执行成功，提交 MQ 消息");
                // 返回 COMMIT_MESSAGE：MQ 消息对下游消费者变为可见
                return LocalTransactionState.COMMIT_MESSAGE;
            } else {
                log.warn("业务逻辑判断失败，回滚 MQ 消息");
                // 返回 ROLLBACK_MESSAGE：MQ Server 删除该消息，下游收不到
                return LocalTransactionState.ROLLBACK_MESSAGE;
            }
        } catch (Exception e) {
            log.error("本地事务执行异常，回滚 MQ 消息", e);
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }

    /**
     * 兜底处理
     * 
     * @param message 消息
     * @return 消息结果状态枚举
     */
    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt message) {
        try {
            // 1. 解析消息
            String jsonString = new String(message.getBody());
            // 首先解析为 MessageBody
            MessageBody messageBody = JSON.parseObject(jsonString, MessageBody.class);
            // 从 MessageBody 中获取真正的业务请求 String 并解析
            OrderCreateRequest request = JSON.parseObject(messageBody.getBody(), OrderCreateRequest.class);

            // 2. 获取库存扣减日志
            InventoryResponse<String> response = inventoryFacade.getInventoryDecreaseLog(request);
            // 3. 判断库存扣减日志是否存在，如果存在则表示本地事务已提交，否则表示本地事务已回滚
            return response.getSuccess() && response.getData() != null ? LocalTransactionState.COMMIT_MESSAGE
                    : LocalTransactionState.ROLLBACK_MESSAGE;
        } catch (Exception e) {
            log.error("回查本地事务异常，回滚 MQ 消息", e);
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }
}
