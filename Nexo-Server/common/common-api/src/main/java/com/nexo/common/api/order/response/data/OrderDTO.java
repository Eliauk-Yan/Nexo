package com.nexo.common.api.order.response.data;

import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.pay.constant.PaymentType;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.user.constant.UserType;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class OrderDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 订单id
     */
    private String orderId;

    /**
     * 业务幂等号
     */
    private String identifier;

    /**
     * 买家id
     */
    private String buyerId;

    /**
     * 买家名称
     */
    private String buyerName;

    /**
     * 买家id类型
     */
    private UserType buyerType;

    /**
     * 卖家id
     */
    private String sellerId;

    /**
     * 卖家名称
     */
    private String sellerName;

    /**
     * 卖家id类型
     */
    private UserType sellerType;

    /**
     * 订单金额
     */
    private BigDecimal totalPrice;

    /**
     * 商品数量
     */
    private Integer quantity;

    /**
     * 商品单价
     */
    private BigDecimal unitPrice;

    /**
     * 已支付金额
     */
    private BigDecimal paymentAmount;

    /**
     * 支付成功时间
     */
    private LocalDateTime paymentTime;

    /**
     * 下单确认时间
     */
    private LocalDateTime confirmTime;

    /**
     * 订单关闭时间
     */
    private LocalDateTime closingTime;

    /**
     * 商品Id
     */
    private String productId;

    /**
     * 商品名称
     */
    private String productName;

    /**
     * 商品类型
     */
    private NFTType NFTType;

    /**
     * 图片地址
     */
    private String productCoverUrl;

    /**
     * 支付方式
     */
    private PaymentType paymentMethod;

    /**
     * 支付流水号
     */
    private String paymentStreamId;

    /**
     * 订单状态
     */
    private TradeOrderState orderState;

    /**
     * 是否超时
     */
    private Boolean timeout;

    /**
     * 支付超时时间
     */
    private LocalDateTime completionTime;

}
