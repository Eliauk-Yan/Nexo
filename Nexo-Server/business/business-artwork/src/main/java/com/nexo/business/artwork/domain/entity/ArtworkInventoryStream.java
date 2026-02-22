package com.nexo.business.artwork.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.artwork.constant.ArtWorkState;
import com.nexo.common.api.product.constant.ProductEvent;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * @classname ArtworkInventoryStream
 * @description 藏品库存流水实体
 * @date 2026/02/08 17:40
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("artwork_inventory_stream")
public class ArtworkInventoryStream extends BaseEntity {

    @TableField("artwork_id")
    private Long artworkId;

    @TableField("changed_quantity")
    private Long changedQuantity;

    @TableField("price")
    private BigDecimal price;

    @TableField("quantity")
    private Long quantity;

    @TableField("state")
    private ArtWorkState state;

    @TableField("saleable_inventory")
    private Long saleableInventory;

    @TableField("frozen_inventory")
    private Long frozenInventory;

    @TableField("stream_type")
    private ProductEvent streamType;

    @TableField("identifier")
    private String identifier;

    @TableField("extend_info")
    private String extendInfo;

}
