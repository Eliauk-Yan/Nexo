package com.nexo.business.trade.service.Impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.IdUtil;
import com.alibaba.fastjson.JSON;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.nexo.business.trade.domain.exception.TradeException;
import com.nexo.business.trade.interfaces.dto.BuyDTO;
import com.nexo.business.trade.interfaces.dto.PayDTO;
import com.nexo.business.trade.interfaces.vo.PayVO;
import com.nexo.business.trade.service.TradeService;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.nft.response.data.NFTInfo;
import com.nexo.common.api.nft.response.data.NFTInventoryStreamDTO;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.order.request.OrderTimeoutRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.order.response.data.OrderDTO;
import com.nexo.common.api.pay.PayFacade;
import com.nexo.common.api.pay.request.PayCreateRequest;
import com.nexo.common.api.pay.response.PayOrderDTO;
import com.nexo.common.api.pay.response.PayResponse;
import com.nexo.common.api.user.constant.UserType;
import com.nexo.common.mq.producer.StreamProducer;
import com.nexo.common.web.filter.TokenFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

import static com.nexo.business.trade.domain.exception.TradeErrorCode.GOODS_NOT_FOR_SALE;
import static com.nexo.business.trade.domain.exception.TradeErrorCode.ORDER_CREATE_FAILED;
import static com.nexo.business.trade.domain.exception.TradeErrorCode.ORDER_IS_CANNOT_PAY;
import static com.nexo.business.trade.domain.exception.TradeErrorCode.ORDER_NOT_EXIST;
import static com.nexo.business.trade.domain.exception.TradeErrorCode.PAY_PERMISSION_DENIED;
import static com.nexo.common.api.nft.constant.ProductState.SELLING;
import static com.nexo.common.api.user.constant.UserType.PLATFORM;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeServiceImpl implements TradeService {

    private static final ThreadFactory inventoryBypassVerifyThreadFactory = new ThreadFactoryBuilder()
            .setNameFormat("inventory-bypass-verify-pool-%d")
            .build();

    private final ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(
            10,
            inventoryBypassVerifyThreadFactory);

    private final StreamProducer streamProducer;

    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;

    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    @DubboReference(version = "1.0.0")
    private PayFacade payFacade;

    @Override
    public String buy(BuyDTO params) {
        // 1. 雪花算法生成订单号
        String orderId = IdUtil.getSnowflakeNextIdStr();
        // 2. 构造创建订单请求
        OrderCreateRequest orderCreateRequest = new OrderCreateRequest();
        orderCreateRequest.setOrderId(orderId);
        orderCreateRequest.setIdentifier(TokenFilter.tokenThreadLocal.get());
        orderCreateRequest.setBuyerId(StpUtil.getLoginIdAsString());
        orderCreateRequest.setProductId(params.getProductId());
        orderCreateRequest.setNFTType(NFTType.NFT);
        orderCreateRequest.setItemCount(params.getItemCount());
        NFTResponse<NFTInfo> response = nftFacade.getNFTInfoById(Long.parseLong(params.getProductId()));
        NFTInfo nft = response.getData();
        if (nft == null || nft.getProductState() != SELLING) {
            throw new TradeException(GOODS_NOT_FOR_SALE);
        }
        orderCreateRequest.setItemPrice(nft.getPrice());
        orderCreateRequest.setSellerId("0");
        orderCreateRequest.setProductName(nft.getName());
        orderCreateRequest.setProductPicUrl(nft.getCover());
        orderCreateRequest.setSnapshotVersion(nft.getVersion());
        orderCreateRequest.setOrderAmount(
                orderCreateRequest.getItemPrice().multiply(new BigDecimal(orderCreateRequest.getItemCount())));
        // 3. 发送MQ消息进行订单创建
        boolean result = streamProducer.send("buy-out-0", params.getNftType(), JSON.toJSONString(orderCreateRequest));
        if (!result) {
            throw new TradeException(ORDER_CREATE_FAILED);
        }
        // 构造库存请求
        InventoryRequest inventoryRequest = new InventoryRequest();
        inventoryRequest.setNftId(orderCreateRequest.getProductId());
        inventoryRequest.setNFTType(orderCreateRequest.getNFTType());
        inventoryRequest.setIdentifier(orderCreateRequest.getIdentifier());
        InventoryResponse<String> decreaseLogResponse = inventoryFacade.getInventoryDecreaseLog(inventoryRequest);
        if (decreaseLogResponse.getSuccess() && decreaseLogResponse.getData() != null) {
            InventoryResponse<String> increaseLogResponse = inventoryFacade.getInventoryIncreaseLog(inventoryRequest);
            log.info("库存回退日志查询结果, orderId={}, increaseLogData={}",
                    orderCreateRequest.getOrderId(), increaseLogResponse.getData());

            // 没有发生库存回退时，做一次旁路校验并清理扣减日志
            if (!(increaseLogResponse.getSuccess() && increaseLogResponse.getData() != null)) {
                scheduler.schedule(() -> {
                    try {
                        NFTResponse<NFTInventoryStreamDTO> streamResponse = nftFacade.getNFTInventoryStream(
                                Long.parseLong(orderCreateRequest.getProductId()),
                                orderCreateRequest.getIdentifier());
                        if (streamResponse.getSuccess()
                                && streamResponse.getData() != null
                                && Objects.equals(
                                        streamResponse.getData().getChangedQuantity(),
                                        orderCreateRequest.getItemCount())) {
                            InventoryResponse<Long> removeLogResponse =
                                    inventoryFacade.removeInventoryDecreaseLog(inventoryRequest);
                            log.info("Redis库存扣减流水记录删除结果, orderId={}, result={}",
                                    orderCreateRequest.getOrderId(), removeLogResponse.getData());
                        }
                    } catch (Exception e) {
                        log.error("旁路校验异常, orderId={}, identifier={}",
                                orderCreateRequest.getOrderId(), orderCreateRequest.getIdentifier(), e);
                    }
                }, 3, TimeUnit.SECONDS);
            }

            return orderCreateRequest.getOrderId();
        }

        log.error("库存扣减日志未查到, orderId={}, identifier={}, response={}",
                orderCreateRequest.getOrderId(),
                orderCreateRequest.getIdentifier(),
                decreaseLogResponse.getData());
        throw new TradeException(ORDER_CREATE_FAILED);
    }

    @Override
    public PayVO pay(PayDTO payParams) {
        Long userId = StpUtil.getLoginIdAsLong();
        OrderResponse<OrderDTO> response = orderFacade.getOrder(payParams.getOrderId(), userId);
        OrderDTO order = response.getData();

        if (order == null) {
            throw new TradeException(ORDER_NOT_EXIST);
        }

        if (order.getOrderState() != TradeOrderState.CONFIRM) {
            throw new TradeException(ORDER_IS_CANNOT_PAY);
        }

        if (Boolean.TRUE.equals(order.getTimeout())) {
            Thread.ofVirtual().start(() -> {
                OrderTimeoutRequest cancelRequest = new OrderTimeoutRequest();
                cancelRequest.setOperatorType(PLATFORM);
                cancelRequest.setOperator(PLATFORM.getCode());
                cancelRequest.setOrderId(order.getOrderId());
                cancelRequest.setOperateTime(LocalDateTime.now());
                cancelRequest.setIdentifier(UUID.randomUUID().toString());
                orderFacade.timeout(cancelRequest);
            });
            throw new TradeException(ORDER_IS_CANNOT_PAY);
        }

        if (!order.getBuyerId().equals(userId.toString())) {
            throw new TradeException(PAY_PERMISSION_DENIED);
        }

        PayCreateRequest payCreateRequest = new PayCreateRequest();
        payCreateRequest.setBizNo(order.getOrderId());
        payCreateRequest.setBizType("TRADE_ORDER");
        payCreateRequest.setOrderAmount(order.getTotalPrice());
        payCreateRequest.setPayerId(StpUtil.getLoginIdAsString());
        payCreateRequest.setPayerType(UserType.CUSTOMER);
        payCreateRequest.setPayeeId(order.getSellerId());
        payCreateRequest.setPayeeType(PLATFORM);
        payCreateRequest.setPayChannel(payParams.getPaymentType());
        payCreateRequest.setMemo(order.getProductName());

        PayResponse<PayOrderDTO> payResponse = payFacade.createPayOrder(payCreateRequest);
        if (!payResponse.getSuccess()) {
            log.error("创建支付单失败, orderId={}, msg={}", order.getOrderId(), payResponse.getMessage());
            throw new TradeException(ORDER_IS_CANNOT_PAY);
        }

        PayOrderDTO payOrderDTO = payResponse.getData();
        PayVO payVO = new PayVO();
        payVO.setPayOrderId(payOrderDTO.getPayOrderId());
        payVO.setPayUrl(payOrderDTO.getPayUrl());
        payVO.setPayState(payOrderDTO.getOrderState());
        return payVO;
    }
}
