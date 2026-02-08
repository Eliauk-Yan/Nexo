package com.nexo.business.trade.service.Impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.IdUtil;
import com.alibaba.fastjson.JSON;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.nexo.business.trade.domain.exception.TradeException;
import com.nexo.business.trade.interfaces.dto.BuyDTO;
import com.nexo.business.trade.service.TradeService;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.product.ProductFacade;
import com.nexo.common.api.product.constant.ProductEvent;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.product.response.ProductResponse;
import com.nexo.common.api.product.response.data.ProductDTO;
import com.nexo.common.api.product.response.data.ProductStreamDTO;
import com.nexo.common.mq.producer.StreamProducer;
import lombok.RequiredArgsConstructor;
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
public class TradeServiceImpl implements TradeService {

    /**
     * 线程本地变量 用于存储订单的幂等号
     */
    public static final ThreadLocal<String> tokenThreadLocal = new ThreadLocal<>();

    /**
     * 生产者
     */
    private final StreamProducer streamProducer;

    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    @DubboReference(version = "1.0.0")
    private ProductFacade productFacade;

    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    @Override
    public String buy(BuyDTO params) {
        // 1. 创建订单请求
        String userId = StpUtil.getLoginIdAsString();
        // 2. 雪花算法生成订单ID
        String orderId = IdUtil.getSnowflakeNextIdStr();
        // 3. 构造创建订单请求
        OrderCreateRequest orderCreateRequest = new OrderCreateRequest();
        orderCreateRequest.setOrderId(orderId); // 设置订单ID
        orderCreateRequest.setIdentifier(tokenThreadLocal.get()); // 设置幂等号
        orderCreateRequest.setBuyerId(StpUtil.getLoginIdAsString()); // 设置买家ID
        orderCreateRequest.setProductId(params.getProductId()); // 设置商品ID
        orderCreateRequest.setProductType(ProductType.ARTWORK); // 设置商品类型
        orderCreateRequest.setItemCount(params.getItemCount()); // 设置商品数量
        // 2. 调用商品服务填充订单请求
        ProductResponse<ProductDTO> response = productFacade.getProduct(params.getProductId(), ProductType.ARTWORK);
        ProductDTO product = response.getData();
        if (product == null || product.available()) {
            throw new TradeException(GOODS_NOT_FOR_SALE);
        }
        orderCreateRequest.setItemPrice(product.getPrice()); // 设置商品单价
        orderCreateRequest.setSellerId(product.getSellerId()); // 设置卖家ID
        orderCreateRequest.setProductName(product.getProductName()); // 设置商品名称
        orderCreateRequest.setProductPicUrl(product.getProductPicUrl()); // 设置商品封面
        orderCreateRequest.setSnapshotVersion(product.getVersion()); // 设置快照版本
        orderCreateRequest.setOrderAmount(orderCreateRequest.getItemPrice().multiply(new BigDecimal(orderCreateRequest.getItemCount()))); // 设置订单总价
        // 3. 发送MQ消息
        boolean result = streamProducer.send("buy-out-0", params.getProductType().getCode(), JSON.toJSONString(orderCreateRequest));
        if (!result) {
            throw new TradeException(ORDER_CREATE_FAILED);
        }
        // 4. Redis库存预扣减
        InventoryRequest inventoryRequest = new InventoryRequest();


        return "";
    }
}
