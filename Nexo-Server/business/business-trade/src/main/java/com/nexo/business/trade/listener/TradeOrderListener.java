package com.nexo.business.trade.listener;

import com.alibaba.fastjson2.JSON;
import com.nexo.business.trade.domain.exception.TradeException;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.request.NFTCancelSaleRequest;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.constant.TradeOrderEvent;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.OrderCancelRequest;
import com.nexo.common.api.order.request.OrderTimeoutRequest;
import com.nexo.common.api.order.request.OrderUpdateRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.order.response.data.OrderDTO;
import com.nexo.common.mq.message.MessageBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

import static com.nexo.business.trade.domain.exception.TradeErrorCode.INVENTORY_ROLLBACK_FAILED;
import static com.nexo.common.mq.consumer.StreamConsumer.getMessage;

/**
 * 订单监听器
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TradeOrderListener {

    /**
     * 库存服务接口
     */
    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    /**
     * 藏品服务接口
     */
    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;

    /**
     * 订单服务接口
     */
    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    @Bean
    Consumer<Message<MessageBody>> orderClose() {
        return msg -> {
            // 1. 获取消息参数 判断关单类型
            String closeType = msg.getHeaders().get("CLOSE_TYPE", String.class);
            // 2. 根据关单类型 解析消息
            OrderUpdateRequest orderUpdateRequest;
            if (TradeOrderEvent.CANCEL.getCode().equals(closeType)) {
                orderUpdateRequest = getMessage(msg, OrderCancelRequest.class);
            } else if (TradeOrderEvent.TIME_OUT.name().equals(closeType)) {
                orderUpdateRequest = getMessage(msg, OrderTimeoutRequest.class);
            } else {
                throw new UnsupportedOperationException("unsupported closeType " + closeType);
            }
            // 3. 获取订单信息
            OrderResponse<OrderDTO> orderResponse = orderFacade.getOrder(orderUpdateRequest.getOrderId(), null);
            if (!orderResponse.getSuccess()) {
                log.error("获取订单信息失败, 关单请求:{} , 订单查询响应 : {}", JSON.toJSONString(orderUpdateRequest), JSON.toJSONString(orderResponse));
                throw new TradeException(INVENTORY_ROLLBACK_FAILED);
            }
            // 4. 校验订单状态
            OrderDTO orderDTO = orderResponse.getData();
            if (orderDTO.getOrderState() != TradeOrderState.CLOSED) {
                log.error("订单状态非法 ,关单请求:{} , 当前订单: {}", JSON.toJSONString(orderUpdateRequest), JSON.toJSONString(orderDTO));
                throw new TradeException(INVENTORY_ROLLBACK_FAILED);
            }
            // 5. 回滚数据库
            NFTCancelSaleRequest nftCancelSaleRequest = new NFTCancelSaleRequest();
            nftCancelSaleRequest.setIdentifier(orderDTO.getIdentifier());
            nftCancelSaleRequest.setQuantity(orderDTO.getQuantity());
            nftCancelSaleRequest.setNFTId(Long.parseLong(orderDTO.getProductId()));
            NFTResponse<Long> nftResponse = nftFacade.cancelSale(nftCancelSaleRequest);
            if (!nftResponse.getSuccess()) {
                log.error("回滚数据库失败, 关单请求:{} , 响应: {}", JSON.toJSONString(orderUpdateRequest), JSON.toJSONString(nftResponse));
                throw new TradeException(INVENTORY_ROLLBACK_FAILED);
            }
            // 6. 回滚Redis库存
            InventoryRequest inventoryRequest = new InventoryRequest();
            inventoryRequest.setInventory(Long.valueOf(orderDTO.getQuantity()));
            inventoryRequest.setNftId(orderDTO.getProductId());
            inventoryRequest.setIdentifier(orderDTO.getIdentifier());
            inventoryRequest.setNftType(orderDTO.getNftType());
            InventoryResponse<Boolean> inventoryResponse = inventoryFacade.increaseInventory(inventoryRequest);
            if (inventoryResponse.getSuccess()) {
                log.info("Redis库存回滚成功, 回滚库存请求:{}", inventoryRequest);
            } else {
                log.error("Redis库存回滚失败, 关单请求:{} , 响应: {}", JSON.toJSONString(orderUpdateRequest), JSON.toJSONString(inventoryResponse));
                throw new TradeException(INVENTORY_ROLLBACK_FAILED);
            }
        };
    }


}
