package com.nexo.common.api.order.request;

import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.user.constant.UserType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * @classname OrderCreateRequest
 * @description 创建订单请求
 * @date 2026/02/06 01:12
 */
@Getter
@Setter
public class OrderCreateRequest extends OrderBaseRequest {

    /**
     * 买家id
     */
    @NotNull(message = "买家id不能为空")
    private String buyerId;

    /**
     * 买家id类型
     */
    private UserType buyerType = UserType.CUSTOMER;

    /**
     * 卖家id
     */
    @NotNull(message = "卖家id不能为空")
    private String sellerId;

    /**
     * 卖家id类型
     */
    private UserType sellerType = UserType.PLATFORM;

    /**
     * 订单金额
     */
    @DecimalMin(value = "0.0", inclusive = false, message = "订单金额必须大于0")
    private BigDecimal orderAmount;

    /**
     * 商品Id
     */
    @NotNull(message = "商品Id不能为空")
    private String productId;

    /**
     * 商品类型
     */
    private ProductType productType;

    /**
     * 商品图片
     */
    private String productPicUrl;

    /**
     * 商品名称
     */
    private String productName;

    /**
     * 商品数量
     */
    @Min(value = 1)
    private Long itemCount;

    /**
     * 商品单价
     */
    @DecimalMin(value = "0.0", inclusive = false, message = "商品单价必须大于0")
    private BigDecimal itemPrice;

    /**
     * 快照版本
     */
    private Integer snapshotVersion;

    /**
     * 交易订单号
     */
    private String orderId;

}
