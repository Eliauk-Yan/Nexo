package com.nexo.common.api.product.response.data;

import com.nexo.common.api.product.constant.ProductState;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname ProductDTO
 * @description 商品
 * @date 2026/02/07 01:59
 */
@Setter
@Getter
public abstract class ProductDTO implements Serializable {

    private ProductState productState;

    /**
     * 商品名称
     */
    public abstract String getProductName();

    /**
     * 商品图片
     */
    public abstract String getProductPicUrl();

    /**
     * 卖家id
     */
    public abstract String getSellerId();

    /**
     * 版本
     */
    public abstract Integer getVersion();

    /**
     * 是否可用
     */
    public Boolean available() {
        return this.productState == ProductState.SELLING;
    }

    /**
     * 价格
     */
    public abstract BigDecimal getPrice();

    /**
     * 是否预约商品
     */
    public abstract Boolean canBook();

    /**
     * 当前是否可预约
     */
    public abstract Boolean canBookNow();

    /**
     * 是否已预约过
     */
    public abstract Boolean hasBooked();

    /**
     * 商品预约开始时间
     */
    public abstract LocalDateTime getBookStartTime();

    /**
     * 商品预约结束时间
     */
    public abstract LocalDateTime getBookEndTime();
}
