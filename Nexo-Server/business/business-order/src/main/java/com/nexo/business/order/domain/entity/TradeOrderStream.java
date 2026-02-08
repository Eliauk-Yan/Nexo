package com.nexo.business.order.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.user.constant.UserType;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname TradeOrderStream
 * @description 订单流水表
 * @date 2026/02/08 16:14
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("trade_order_stream")
public class TradeOrderStream extends BaseEntity {

    @TableField(value = "order_id")
    private String orderId;

    @TableField(value = "buyer_id")
    private String buyerId;

    @TableField(value = "buyer_type")
    private UserType buyerType;

    @TableField(value = "seller_id")
    private String sellerId;

    @TableField(value = "seller)type")
    private UserType sellerType;

    @TableField(value = "identifier")
    private String identifier;

    @TableField(value = "product_id")
    private String productId;

    @TableField(value = "product_type")
    private ProductType productType;

    @TableField(value = "product_cover_url")
    private String productCoverUrl;

    @TableField(value = "product_name")
    private String productName;

    @TableField(value = "unit_price")
    private BigDecimal unitPrice;

    @TableField(value = "quantity")
    private Integer quantity;

    @TableField(value = "total_price")
    private BigDecimal totalPrice;

    @TableField(value = "order_state")
    private TradeOrderState orderState;

    @TableField(value = "payment_amount")
    private BigDecimal paymentAmount;

    @TableField(value = "payment_time")
    private LocalDateTime paymentTime;

    @TableField(value = "confirmedTime")
    private LocalDateTime confirmedTime;

    @TableField(value = "completion_time")
    private LocalDateTime completionTime;

    @TableField(value = "cosing_time")
    private LocalDateTime cosingTime;

    @TableField(value = "payment_method")
    private String paymentMethod;

    @TableField(value = "payment_stream_id")
    private String paymentStreamId;

    @TableField(value = "close_type")
    private String closeType;

    @TableField(value = "snapshot_version")
    private Integer snapshotVersion;

    @TableField(value = "stream_identifier")
    private String streamIdentifier;

    @TableField(value = "stream_type")
    private String streamType;
}
