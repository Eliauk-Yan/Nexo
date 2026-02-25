package com.nexo.common.api.artwork.response.data;

import com.nexo.common.api.artwork.constant.ArtWorkState;
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

    private Long id;

    private String name;

    private String cover;

    private BigDecimal price;

    private String description;

    private Long quantity;

    private Long saleableInventory;

    private Long frozenInventory;

    private LocalDateTime saleTime;

    private Integer version;

    private LocalDateTime bookStartTime;

    private LocalDateTime bookEndTime;

    private Boolean canBook;

    private Boolean hasBooked;

    private ArtWorkState state;

    private LocalDateTime syncChainTime;

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
    public Boolean available() {
        // 藏品上链成功才可售卖
        return this.state == ArtWorkState.SUCCESS;
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
