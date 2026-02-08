package com.nexo.business.artwork.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.artwork.constant.ArtWorkState;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname ArtWork
 * @description 艺术藏品实体
 * @date 2025/12/20 12:38
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("artworks")
public class ArtWork extends BaseEntity {

    @TableField(value = "name")
    private String name;

    @TableField(value = "cover")
    private String cover;

    @TableField(value = "class_id")
    private String classId;

    @TableField(value = "price")
    private BigDecimal price;

    @TableField(value = "quantity")
    private Long quantity;

    @TableField(value = "description")
    private String description;

    @TableField(value = "saleable_inventory")
    private Long saleableInventory;

    @TableField(value = "occupied_inventory")
    private Long occupiedInventory;

    @TableField(value = "frozen_inventory")
    private Long frozenInventory;

    @TableField(value = "identifier")
    private String identifier;

    @TableField(value = "state")
    private ArtWorkState state;

    @TableField(value = "sale_time")
    private LocalDateTime saleTime;

    @TableField(value = "sync_chain_time")
    private LocalDateTime syncChainTime;

    @TableField(value = "book_start_time")
    private LocalDateTime bookStartTime;

    @TableField(value = "book_end_time")
    private LocalDateTime bookEndTime;

    @TableField(value = "can_book")
    private Boolean canBook;

    @TableField(value = "creator_id")
    private Long creatorId;
}
