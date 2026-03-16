package com.nexo.business.order.listener;

import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.domain.validator.OrderCreateValidator;
import com.nexo.business.order.mapper.mybatis.OrderMapper;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.nft.request.NFTSaleRequest;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.AndConfirmOrderCreateRequest;
import com.nexo.common.api.order.request.OrderCreateRequest;
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
     * 下单校验责任链
     */
    private final OrderCreateValidator orderCreateValidator;

    /**
     * 订单服务
     */
    private final OrderMapper orderMapper;

    @Bean
    Consumer<Message<MessageBody>> buy() {
        return msg -> {
            // 1. 解析消息
            OrderCreateRequest orderCreateRequest = StreamConsumer.getMessage(msg, OrderCreateRequest.class);
            // 2. 订单创建并提交
            AndConfirmOrderCreateRequest orderCreateAndConfirmRequest = new AndConfirmOrderCreateRequest();
            BeanUtils.copyProperties(orderCreateRequest, orderCreateAndConfirmRequest);
            orderCreateAndConfirmRequest.setOperator(UserType.PLATFORM.getCode());
            orderCreateAndConfirmRequest.setOperatorType(UserType.PLATFORM);
            orderCreateAndConfirmRequest.setOperateTime(LocalDateTime.now());
            try {
                // 2.1 创建订单前校验
                orderCreateValidator.validate(orderCreateAndConfirmRequest);
            } catch (Exception e) {
                // 前置校验失败，记录日志并退出，不再继续执行
                log.error("订单校验失败, orderId={}, 原因={}", orderCreateAndConfirmRequest.getOrderId(), e.getMessage(), e);
                // 回滚Redis库存
                rollbackInventory(orderCreateRequest.getProductId(), orderCreateRequest.getNFTType(), orderCreateRequest.getIdentifier(), orderCreateRequest.getItemCount());
                return;
            }
            // 2.2 同步扣减数据库库存
            NFTSaleRequest saleRequest = new NFTSaleRequest();
            saleRequest.setUserId(orderCreateAndConfirmRequest.getBuyerId());
            saleRequest.setQuantity(orderCreateAndConfirmRequest.getItemCount());
            saleRequest.setBizNo(orderCreateAndConfirmRequest.getOrderId());
            saleRequest.setNftType(orderCreateAndConfirmRequest.getNFTType());
            saleRequest.setIdentifier(orderCreateAndConfirmRequest.getIdentifier());
            saleRequest.setNFTId(Long.parseLong(orderCreateAndConfirmRequest.getProductId())); // 设置商品ID
            NFTResponse<Boolean> response = nftFacade.sale(saleRequest);
            if (!response.getSuccess()) {
                log.error("数据库库存扣减失败, orderId={}", orderCreateAndConfirmRequest.getOrderId());
                // 回滚Redis库存
                rollbackInventory(orderCreateRequest.getProductId(), orderCreateRequest.getNFTType(), orderCreateRequest.getIdentifier(), orderCreateRequest.getItemCount());
                return;
            }
            // 2.3 创建订单记录
            TradeOrder tradeOrder = new TradeOrder();
            tradeOrder.setOrderId(orderCreateAndConfirmRequest.getOrderId());
            tradeOrder.setBuyerId(orderCreateAndConfirmRequest.getBuyerId());
            tradeOrder.setBuyerType(orderCreateAndConfirmRequest.getBuyerType());
            tradeOrder.setSellerId(orderCreateAndConfirmRequest.getSellerId());
            tradeOrder.setSellerType(orderCreateAndConfirmRequest.getSellerType());
            tradeOrder.setIdentifier(orderCreateAndConfirmRequest.getIdentifier());
            tradeOrder.setProductId(orderCreateAndConfirmRequest.getProductId());
            tradeOrder.setNFTType(orderCreateAndConfirmRequest.getNFTType());
            tradeOrder.setProductCoverUrl(orderCreateAndConfirmRequest.getProductPicUrl());
            tradeOrder.setProductName(orderCreateAndConfirmRequest.getProductName());
            tradeOrder.setUnitPrice(orderCreateAndConfirmRequest.getItemPrice());
            tradeOrder.setQuantity(orderCreateAndConfirmRequest.getItemCount().intValue());
            tradeOrder.setTotalPrice(orderCreateAndConfirmRequest.getOrderAmount());
            tradeOrder.setPaymentAmount(orderCreateAndConfirmRequest.getOrderAmount());
            tradeOrder.setOrderState(TradeOrderState.CONFIRM);
            tradeOrder.setSnapshotVersion(orderCreateAndConfirmRequest.getSnapshotVersion());
            boolean result = orderMapper.insert(tradeOrder) == 1;
            if (!result) {
                log.error("订单创建失败, orderId={}", orderCreateAndConfirmRequest.getOrderId());
                // 回滚数据库库存和Redis库存
                rollbackInventory(orderCreateRequest.getProductId(), orderCreateRequest.getNFTType(), orderCreateRequest.getIdentifier(), orderCreateRequest.getItemCount());
                return;
            }
            log.info("订单创建成功, orderId={}", orderCreateAndConfirmRequest.getOrderId());
        };
    }

    /**
     * 回滚redis库存
     */
    private void rollbackInventory(String nftId, NFTType nftType, String identifier, Long inventory) {
        inventoryFacade.increaseInventory(new InventoryRequest(nftId, nftType, identifier, inventory));
    }

}
