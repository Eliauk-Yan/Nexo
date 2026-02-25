package com.nexo.business.trade.service.Impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.IdUtil;
import com.alibaba.fastjson.JSON;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.nexo.business.trade.domain.exception.TradeException;
import com.nexo.business.trade.interfaces.dto.BuyDTO;
import com.nexo.business.trade.service.TradeService;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.product.ProductFacade;
import com.nexo.common.api.product.constant.ProductEvent;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.product.response.ProductResponse;
import com.nexo.common.api.product.response.data.ProductDTO;
import com.nexo.common.api.product.response.data.ProductInventoryStreamDTO;
import com.nexo.common.mq.producer.StreamProducer;
import com.nexo.common.web.filter.TokenFilter;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

import static com.nexo.business.trade.domain.exception.TradeErrorCode.GOODS_NOT_FOR_SALE;
import static com.nexo.business.trade.domain.exception.TradeErrorCode.ORDER_CREATE_FAILED;

/**
 * @classname TradeServiceImpl
 * @description 交易服务实现类
 * @date 2026/02/07 00:53
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TradeServiceImpl implements TradeService {

    private static final ThreadFactory inventoryBypassVerifyThreadFactory = new ThreadFactoryBuilder()
            .setNameFormat("inventory-bypass-verify-pool-%d").build();

    private final ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(10,
            inventoryBypassVerifyThreadFactory);

    /**
     * 生产者
     */
    private final StreamProducer streamProducer;

    @DubboReference(version = "1.0.0")
    private ProductFacade productFacade;

    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    @DubboReference(version = "1.0.0")
    private ArtWorkFacade artWorkFacade;

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
        orderCreateRequest.setProductType(ProductType.ARTWORK); // 设置商品类型
        orderCreateRequest.setItemCount(params.getItemCount()); // 设置商品数量
        // 3. 调用商品服务填充订单请求
        ArtWorkQueryResponse<ArtWorkDTO> response = artWorkFacade.getArtWorkById(Long.parseLong(params.getProductId()));
        ProductDTO product = response.getData();
        if (product == null || !product.available()) {
            throw new TradeException(GOODS_NOT_FOR_SALE);
        }
        orderCreateRequest.setItemPrice(product.getPrice()); // 设置商品单价
        orderCreateRequest.setSellerId(product.getSellerId()); // 设置卖家ID
        orderCreateRequest.setProductName(product.getProductName()); // 设置商品名称
        orderCreateRequest.setProductPicUrl(product.getProductPicUrl()); // 设置商品封面
        orderCreateRequest.setSnapshotVersion(product.getVersion()); // 设置快照版本
        orderCreateRequest.setOrderAmount(
                orderCreateRequest.getItemPrice().multiply(new BigDecimal(orderCreateRequest.getItemCount()))); // 设置订单总价
        // 4. 发送MQ消息,监听并进行Redis库存预扣减
        boolean result = streamProducer.send("buy-out-0", params.getProductType().getCode(),
                JSON.toJSONString(orderCreateRequest));
        if (!result) {
            throw new TradeException(ORDER_CREATE_FAILED);
        }
        // 5. 查询Redis库存扣减日志判断是否成功（增加重试机制，等待MQ事务完成）
        InventoryResponse<String> decreaseLogResponse = null;
        for (int i = 0; i < 3; i++) {
            decreaseLogResponse = inventoryFacade.getInventoryDecreaseLog(orderCreateRequest);
            if (decreaseLogResponse.getSuccess() && decreaseLogResponse.getData() != null) {
                break;
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        if (decreaseLogResponse != null && decreaseLogResponse.getSuccess() && decreaseLogResponse.getData() != null) {
            // 6. 再检查一下是否有回退库存的流水，如果回退过，则不需要旁路验证
            InventoryResponse<String> increaseLogResponse = inventoryFacade.getInventoryIncreaseLog(orderCreateRequest);
            if (increaseLogResponse.getSuccess() && increaseLogResponse.getData() == null) {
                // 7. 旁路校验
                scheduler.schedule(() -> {
                    try {
                        // 7.1 查询数据库中是否有库存扣减记录
                        ProductResponse<ProductInventoryStreamDTO> inventoryStream = productFacade
                                .getProductInventoryStream(
                                        orderCreateRequest.getProductId(), orderCreateRequest.getProductType(),
                                        ProductEvent.TRY_SALE, orderCreateRequest.getIdentifier());
                        // 7.2 校验成功 数据一致
                        if (inventoryStream.getSuccess() && inventoryStream.getData() != null && Objects.equals(
                                inventoryStream.getData().getChangedQuantity(), orderCreateRequest.getItemCount())) {
                            // 7.3 删除Redis库存扣减流水记录 删除无效数据，避免数据库长期存储压力
                            inventoryFacade.removeInventoryDecreaseLog(orderCreateRequest);
                        }
                    } catch (Exception e) {
                        log.error("旁路校验异常, orderId={}, identifier={}", orderCreateRequest.getOrderId(),
                                orderCreateRequest.getIdentifier(), e);
                    }
                }, 3, TimeUnit.SECONDS);
                // 8. 返回订单号
                return orderCreateRequest.getOrderId();
            }
        }
        throw new TradeException(ORDER_CREATE_FAILED);
    }

    @PreDestroy
    public void destroy() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
