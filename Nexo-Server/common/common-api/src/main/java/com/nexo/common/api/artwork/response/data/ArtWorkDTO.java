package com.nexo.common.api.artwork.response.data;

import com.nexo.common.api.product.response.data.ProductDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;

import java.time.LocalDateTime;

/**
 * @classname ArtWorkDetailData
 * @description 藏品详情数据
 * @date 2026/01/09 10:31
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ArtWorkDTO extends ProductDTO implements Serializable {

    /**
     * 主键ID
     */
    private Long id;
    /**
     * '藏品名称'
     */
    private String name;
    /**
     * '藏品封面'
     */
    private String cover;

    /**
     * '价格'
     */
    private BigDecimal price;

    /**
     * '藏品数量'
     */
    private Long quantity;

    /**
     * '库存'
     */
    private Long inventory;

    /**
     * '藏品发售时间'
     */
    private LocalDateTime saleTime;

    /**
     * 版本
     */
    private Integer version;

    /**
     * 预约开始时间
     */
    private LocalDateTime bookStartTime;

    /**
     * 预约结束时间
     */
    private LocalDateTime bookEndTime;

    /**
     * 是否预约
     */
    private Boolean canBook;

    /**
     * 是否已预约过
     */
    private Boolean hasBooked;

    @Override
    public String getProductName() {
        return this.name;
    }

    @Override
    public String getProductPicUrl() {
        return this.cover;
    }

    @Override
    public String getSellerId() {
        // 藏品持有人默认是平台 使用0表示
        return "0";
    }

    @Override
    public Integer getVersion() {
        return this.version;
    }

    @Override
    public BigDecimal getPrice() {
        return this.price;
    }

    @Override
    public Boolean canBook() {
        if (canBook == null) {
            return false;
        }
        return canBook;
    }

    @Override
    public Boolean canBookNow() {
        // 当前时间是否在 bookStartTime 和 bookEndTime 之间
        if (canBook()) {
            LocalDateTime now = LocalDateTime.now();
            return bookStartTime.isBefore(now) && bookEndTime.isAfter(now);
        }
        return false;
    }

    @Override
    public Boolean hasBooked() {
        return this.hasBooked;
    }

    @Override
    public LocalDateTime getBookStartTime() {
        return this.bookStartTime;
    }

    @Override
    public LocalDateTime getBookEndTime() {
        return this.bookEndTime;
    }
}
