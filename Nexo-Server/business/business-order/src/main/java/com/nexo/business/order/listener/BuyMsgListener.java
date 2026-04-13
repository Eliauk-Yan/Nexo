package com.nexo.business.order.listener;

import com.alibaba.fastjson2.JSON;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.domain.exception.OrderErrorCode;
import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.request.OrderCreateAndConfirmRequest;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.user.constant.UserType;
import com.nexo.common.mq.consumer.StreamConsumer;
import com.nexo.common.mq.message.MessageBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.function.Consumer;

import static com.nexo.business.order.domain.exception.OrderErrorCode.ORDER_CREATE_VALID_FAILED;

/**
 * @classname BuyMsgListener
 * @description 下单消息监听器
 * @date 2026/02/14 02:08
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class BuyMsgListener {

    /**
     * NFT服务接口
     */
    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;

    /**
     * 库存服务接口
     */
    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    /**
     * 订单接口
     */
    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    /**
     * 订单服务
     */
    private final OrderService orderService;

    @Bean
    Consumer<Message<MessageBody>> buy() {
        return msg -> {
            // 1. 解析消息
            OrderCreateRequest orderCreateRequest = StreamConsumer.getMessage(msg, OrderCreateRequest.class);
            // 2. 订单创建并确认
            OrderCreateAndConfirmRequest orderCreateAndConfirmRequest = new OrderCreateAndConfirmRequest();
            BeanUtils.copyProperties(orderCreateRequest, orderCreateAndConfirmRequest);
            orderCreateAndConfirmRequest.setOperator(UserType.PLATFORM.getCode());
            orderCreateAndConfirmRequest.setOperatorType(UserType.PLATFORM);
            orderCreateAndConfirmRequest.setOperateTime(LocalDateTime.now());
            // 3 创建订单记录
            OrderResponse<Boolean> orderResponse = orderFacade.createAndConfirm(orderCreateAndConfirmRequest);
            //4. 订单因为校验前置校验不通过而下单失败，回滚库存
            if (!orderResponse.getSuccess() && ORDER_CREATE_VALID_FAILED.getCode().equals(orderResponse.getCode())) {
                String orderId = orderResponse.getOrderId();
                TradeOrder tradeOrder = orderService.getOrder(orderId, null);
                //再重新查一次，避免出现并发情况
                if (tradeOrder == null) {
                    InventoryRequest inventoryRequest = new InventoryRequest();
                    inventoryRequest.setNftId(orderCreateRequest.getProductId());
                    inventoryRequest.setInventory(orderCreateRequest.getItemCount());
                    inventoryRequest.setIdentifier(orderCreateRequest.getOrderId());
                    inventoryRequest.setNftType(orderCreateRequest.getNftType());
                    InventoryResponse<Boolean> inventoryResponse = inventoryFacade.increaseInventory(inventoryRequest);
                    if (inventoryResponse.getSuccess()) {
                        log.info("库存回滚成功,库存增加请求:{}", inventoryRequest);
                        return;
                    } else {
                        log.error("库存回滚失败,订单创建请求:{} , 库存增加请求 : {}", JSON.toJSONString(orderCreateRequest), JSON.toJSONString(inventoryRequest));
                        throw new OrderException(OrderErrorCode.INVENTORY_INCREASE_FAILED);
                    }
                }
            }
        };
    }

}
