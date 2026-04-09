package com.nexo.business.order.domain.entity;

import com.alibaba.fastjson2.annotation.JSONField;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.order.constant.TradeOrderEvent;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.user.constant.UserType;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * @classname TradeOrder
 * @description 订单
 * @date 2026/02/08 02:22
 */
@EqualsAndHashCode(callSuper = true)
@TableName("trade_order")
@Data
public class TradeOrder extends BaseEntity {

    /**
     * 默认超时时间
     */
    public static final int DEFAULT_TIME_OUT_MINUTES = 30;


    private String orderId;

    private String buyerId;

    private UserType buyerType;

    private String sellerId;

    private UserType sellerType;

    private String identifier;

    private String productId;

    @TableField("product_type")
    private NFTType NFTType;

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

    private LocalDateTime closingTime;

    private String paymentMethod;

    private String paymentStreamId;

    private String closeType;

    private Integer snapshotVersion;

    @JSONField(serialize = false)
    public Boolean isTimeout() {
        // 已关闭且为超时关闭
        if (orderState == TradeOrderState.CLOSED && Objects.equals(closeType, TradeOrderEvent.TIME_OUT.getCode())) {
            return true;
        }
        // 未支付订单超时判断
        if (orderState == TradeOrderState.CONFIRM) {
            LocalDateTime timeoutTime = this.getCreatedAt().plusMinutes(TradeOrder.DEFAULT_TIME_OUT_MINUTES);
            return LocalDateTime.now().isAfter(timeoutTime);
        }
        return false;
    }

    // 创建
    public void create() {}

    // 确认
    public void confirm() {

    }

    // 已付款
    public void paid() {}

    // 完成
    public void finish() {
        this.orderState = TradeOrderState.FINISH;
        this.completionTime = LocalDateTime.now();
    }

    // 关闭
    public void close(LocalDateTime closeTime, String closeType) {
        this.setClosingTime(closeTime);
        this.setOrderState(TradeOrderState.CLOSED);
        this.setCloseType(closeType);
    }
}
