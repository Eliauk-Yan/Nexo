package com.nexo.business.collection.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname ArtworkStream
 * @description 藏品流水表
 * @date 2026/02/08 17:51
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("nft_stream")
public class NFTStream extends BaseEntity {

    private String name;

    private String cover;

    private String classId;

    private String classify;

    private String source;

    private Long nftId;

    private BigDecimal price;

    private Long quantity;

    private String description;

    private Long saleableInventory;

    private Long frozenInventory;

    private LocalDateTime createTime;

    private String streamType;

    private LocalDateTime saleTime;

    private LocalDateTime syncChainTime;

    private String identifier;



}
