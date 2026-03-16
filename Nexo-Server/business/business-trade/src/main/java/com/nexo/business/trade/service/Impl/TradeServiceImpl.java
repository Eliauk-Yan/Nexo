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
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.response.InventoryResponse;
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
import com.nexo.common.api.nft.constant.NFTType;
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

import static com.nexo.business.trade.domain.exception.TradeErrorCode.*;
import static com.nexo.common.api.nft.constant.ProductState.SELLING;
import static com.nexo.common.api.user.constant.UserType.PLATFORM;

/**
 * @classname TradeServiceImpl
 * @description 交易服务实现类
 * @date 2026/02/07 00:53
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TradeServiceImpl implements TradeService {

    /**
     * 旁路校验线程工厂
     */
    private static final ThreadFactory inventoryBypassVerifyThreadFactory = new ThreadFactoryBuilder()
            .setNameFormat("inventory-bypass-verify-pool-%d").build();

    /**
     * 旁路校验线程池
     */
    private final ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(10,
            inventoryBypassVerifyThreadFactory);

    /**
     * 消息生产者
     */
    private final StreamProducer streamProducer;

    /**
     * 库存模块Dubbo接口
     */
    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    /**
     * 藏品模块Dubbo接口
     */
    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;

    /**
     * 订单模块Dubbo接口
     */
    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    /**
     * 支付模块Dubbo接口
     */
    @DubboReference(version = "1.0.0")
    private PayFacade payFacade;

    @Override
    public String buy(BuyDTO params) {
        // 1. 雪花算法生成订单ID
        String orderId = IdUtil.getSnowflakeNextIdStr();
        // 2. 构造创建订单请求
        OrderCreateRequest orderCreateRequest = new OrderCreateRequest();
        orderCreateRequest.setOrderId(orderId); // 设置订单ID
        orderCreateRequest.setIdentifier(TokenFilter.tokenThreadLocal.get()); // 设置幂等号
        orderCreateRequest.setBuyerId(StpUtil.getLoginIdAsString()); // 设置买家ID
        orderCreateRequest.setProductId(params.getProductId()); // 设置商品ID
        orderCreateRequest.setNFTType(NFTType.NFT); // 设置商品类型
        orderCreateRequest.setItemCount(params.getItemCount()); // 设置商品数量
        // 3. 调用商品服务填充订单请求
        NFTResponse<NFTInfo> response = nftFacade.getNFTInfoById(Long.parseLong(params.getProductId()));
        NFTInfo nft = response.getData();
        if (nft == null || !(nft.getProductState() == SELLING)) {
            throw new TradeException(GOODS_NOT_FOR_SALE);
        }
        orderCreateRequest.setItemPrice(nft.getPrice()); // 设置商品单价
        orderCreateRequest.setSellerId("0"); // 设置卖家ID
        orderCreateRequest.setProductName(nft.getName()); // 设置商品名称
        orderCreateRequest.setProductPicUrl(nft.getCover()); // 设置商品封面
        orderCreateRequest.setSnapshotVersion(nft.getVersion()); // 设置快照版本
        orderCreateRequest.setOrderAmount(orderCreateRequest.getItemPrice().multiply(new BigDecimal(orderCreateRequest.getItemCount()))); // 设置订单总价
        // 4. 发送MQ消息,监听并进行Redis库存预扣减
        boolean result = streamProducer.send("buy-out-0", params.getNftType(),
                JSON.toJSONString(orderCreateRequest));
        if (!result) {
            throw new TradeException(ORDER_CREATE_FAILED);
        }
        // 5. 查询Redis库存扣减日志判断是否成功（增加重试机制，等待MQ事务完成）
        InventoryRequest inventoryRequest = new InventoryRequest();
        inventoryRequest.setNftId(orderCreateRequest.getProductId());
        inventoryRequest.setNFTType(orderCreateRequest.getNFTType());
        inventoryRequest.setIdentifier(orderCreateRequest.getIdentifier());
        InventoryResponse<String> decreaseLogResponse = inventoryFacade.getInventoryDecreaseLog(inventoryRequest);
        if (decreaseLogResponse.getSuccess() && decreaseLogResponse.getData() != null) {
            // 6. 再检查一下是否有Redis回退库存的流水，如果回退过，则不需要旁路验证
            InventoryResponse<String> increaseLogResponse = inventoryFacade.getInventoryIncreaseLog(inventoryRequest);
            log.info("库存回退日志查询结果, orderId={}, increaseLogData={}", orderCreateRequest.getOrderId(), increaseLogResponse.getData());
            if (increaseLogResponse.getSuccess() && increaseLogResponse.getData() != null) {
                // 7. 旁路校验
                scheduler.schedule(() -> {
                    try {
                        // 7.1 查询数据库中是否有库存扣减记录
                        NFTResponse<NFTInventoryStreamDTO> streamResponse = nftFacade.getNFTInventoryStream(Long.parseLong(orderCreateRequest.getProductId()),  orderCreateRequest.getIdentifier());
                        // 7.2 校验成功 数据一致
                        if (streamResponse.getSuccess() && streamResponse.getData() != null && Objects.equals(streamResponse.getData().getChangedQuantity(), orderCreateRequest.getItemCount())) {
                            // 7.3 删除Redis库存扣减流水记录 删除无效数据，避免数据库长期存储压力
                            InventoryResponse<Long> longInventoryResponse = inventoryFacade.removeInventoryDecreaseLog(inventoryRequest);
                            log.info("Redis库存扣减流水记录删除结果, orderId={}, result={}", orderCreateRequest.getOrderId(), longInventoryResponse.getData());
                        }
                    } catch (Exception e) {
                        log.error("旁路校验异常, orderId={}, identifier={}", orderCreateRequest.getOrderId(),
                                orderCreateRequest.getIdentifier(), e);
                    }
                }, 3, TimeUnit.SECONDS);
                // 8. 返回订单号
                return orderCreateRequest.getOrderId();
            }
        } else {
            log.error("库存扣减日志未查到, orderId={}, identifier={}, response={}", orderCreateRequest.getOrderId(),
                    orderCreateRequest.getIdentifier(), decreaseLogResponse.getData());
        }
        throw new TradeException(ORDER_CREATE_FAILED);
    }

    @Override
    public PayVO pay(PayDTO payParams) {
        // 1. 调用订单服务查找对应订单信息
        Long userId = StpUtil.getLoginIdAsLong();
        OrderResponse<OrderDTO> response = orderFacade.getOrder(payParams.getOrderId(), userId);
        OrderDTO order = response.getData();
        // 2. 订单存在校验
        if (order == null) {
            throw new TradeException(ORDER_NOT_EXIST);
        }
        // 3. 订单状态校验
        if (order.getOrderState() != TradeOrderState.CONFIRM) {
            throw new TradeException(ORDER_IS_CANNOT_PAY);
        }
        // 4. 订单超时校验
        if (Boolean.TRUE.equals(order.getTimeout())) {
            // 4.1 异步关闭订单
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
        // 5. 支付权限校验
        if (!order.getBuyerId().equals(userId.toString())) {
            throw new TradeException(PAY_PERMISSION_DENIED);
        }
        // 6. 调用支付服务创建支付单
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

        // 7. 处理支付响应
        if (!payResponse.getSuccess()) {
            log.error("创建支付单失败, orderId={}, msg={}", order.getOrderId(), payResponse.getMessage());
            throw new TradeException(ORDER_IS_CANNOT_PAY);
        }

        // 7. 组装返回结果
        PayOrderDTO payOrderDTO = payResponse.getData();
        PayVO payVO = new PayVO();
        payVO.setPayOrderId(payOrderDTO.getPayOrderId());
        payVO.setPayUrl(payOrderDTO.getPayUrl());
        payVO.setPayState(payOrderDTO.getOrderState());
        return payVO;
    }
}
