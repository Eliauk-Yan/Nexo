package com.nexo.business.collection.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.nft.constant.NFTState;
import com.nexo.common.api.nft.constant.NFTEvent;
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
@TableName("nft_inventory_stream")
public class NFTInventoryStream extends BaseEntity {

    @TableField("nft_id")
    private Long nftId;

    private Long changedQuantity;

    private BigDecimal price;

    private Long quantity;

    private NFTState state;

    private Long saleableInventory;

    private Long frozenInventory;

    private NFTEvent streamType;

    private String identifier;

    private String extendInfo;

}
