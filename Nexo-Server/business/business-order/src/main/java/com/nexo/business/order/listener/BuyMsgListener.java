package com.nexo.business.order.listener;

import com.alibaba.fastjson2.JSON;
import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.business.order.domain.validator.OrderCreateValidator;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.order.request.OrderCreateAndConfirmRequest;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.product.ProductFacade;
import com.nexo.common.api.product.request.ProductSaleRequest;
import com.nexo.common.api.product.response.ProductResponse;
import com.nexo.common.api.product.response.data.ProductSaleDTO;
import com.nexo.common.api.user.constant.UserType;
import com.nexo.common.mq.message.MessageBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.function.Consumer;

import static com.nexo.common.mq.producer.StreamProducer.*;

/**
 * @classname BuyMsgListener
 * @description 下单消息监听器
 * @date 2026/02/14 02:08
 */
@Component
@Slf4j
@ConditionalOnProperty(value = "rocketmq.broker.check", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class BuyMsgListener {

    @DubboReference(version = "1.0.0")
    private ProductFacade productFacade;

    /**
     * 下单校验责任链
     */
    private final OrderCreateValidator orderCreateValidator;

    @Bean
    Consumer<Message<MessageBody>> buy() {
        return msg -> {
            // 1. 解析消息
            String messageId = msg.getHeaders().get(ROCKET_MQ_MESSAGE_ID, String.class); // 消息 ID
            String tag = msg.getHeaders().get(ROCKET_TAGS, String.class); // 消息标签
            String topic = msg.getHeaders().get(ROCKET_MQ_TOPIC, String.class); // 消息主题
            OrderCreateRequest orderCreateRequest = JSON.parseObject(msg.getPayload().getBody(), OrderCreateRequest.class); // 消息体
            log.info("消息已接收 主题:{} 消息ID:{}, 消息内容:{}, 标签:{}", topic, messageId, JSON.toJSONString(orderCreateRequest), tag);
            // 2. 订单创建并提交
            OrderCreateAndConfirmRequest orderCreateAndConfirmRequest = new OrderCreateAndConfirmRequest();
            BeanUtils.copyProperties(orderCreateRequest, orderCreateAndConfirmRequest);
            orderCreateAndConfirmRequest.setOperator(UserType.PLATFORM.name());
            orderCreateAndConfirmRequest.setOperatorType(UserType.PLATFORM);
            orderCreateAndConfirmRequest.setOperateTime(LocalDateTime.now());

            try {
                // 2.1 创建订单前校验
                orderCreateValidator.validate(orderCreateAndConfirmRequest);
            } catch (OrderException e) {
                // 前置校验失败回滚库存

            }
            // 2.2 同步扣减库存
            ProductSaleRequest saleRequest = new ProductSaleRequest();
            saleRequest.setUserId(orderCreateAndConfirmRequest.getBuyerId());
            saleRequest.setQuantity(orderCreateAndConfirmRequest.getItemCount());
            saleRequest.setBizNo(orderCreateAndConfirmRequest.getOrderId());
            saleRequest.setProductType(orderCreateAndConfirmRequest.getProductType());
            saleRequest.setIdentifier(orderCreateAndConfirmRequest.getIdentifier());
            ProductResponse<ProductSaleDTO> response = productFacade.sale(saleRequest);

        };
    }

}
