package com.nexo.business.order.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.user.constant.UserType;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

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
@NoArgsConstructor
public class TradeOrderStream extends BaseEntity {

    private String orderId;

    private String buyerId;

    private UserType buyerType;

    private String sellerId;

    private UserType sellerType;

    private String identifier;

    private String productId;

    @TableField("product_type")
    private NFTType productType;

    private String productCoverUrl;

    private String productName;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal totalPrice;

    private TradeOrderState orderState;

    private BigDecimal paymentAmount;

    private LocalDateTime paymentTime;

    private LocalDateTime confirmedTime;

    private LocalDateTime completionTime;

    @TableField("closing_time")
    private LocalDateTime cosingTime;

    private String paymentMethod;

    @TableField("pay_stream_id")
    private String paymentStreamId;

    private String closeType;

    private Integer snapshotVersion;

    private String streamIdentifier;

    private String streamType;


}
