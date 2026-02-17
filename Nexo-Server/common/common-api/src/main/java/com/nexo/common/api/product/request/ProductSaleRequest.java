package com.nexo.common.api.product.request;

import com.nexo.common.api.product.constant.ProductEvent;
import com.nexo.common.api.product.constant.ProductSaleBizType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * @classname ProductSaleRequest
 * @description 商品售卖请求
 * @date 2026/02/16 02:25
 */
@Setter
@Getter
public class ProductSaleRequest extends BaseProductRequest {

    /**
     * 藏品名称
     */
    private String name;

    /**
     * 藏品封面
     */
    private String cover;

    /**
     * 购入价格
     */
    private BigDecimal purchasePrice;

    /**
     * 持有人id
     */
    private String userId;

    /**
     * 销售数量
     */
    private Long quantity;

    /**
     * 业务单号
     */
    private String bizNo;

    /**
     * 业务类型
     */
    private ProductSaleBizType bizType;


    @Override
    public ProductEvent getEventType() {
        return ProductEvent.SALE;
    }

}
