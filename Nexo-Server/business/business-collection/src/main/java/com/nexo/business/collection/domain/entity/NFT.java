package com.nexo.business.collection.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.artwork.constant.NFTState;
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
@TableName("nft")
public class NFT extends BaseEntity {

    private String name;

    private String cover;

    private String classId;

    private BigDecimal price;

    private Long quantity;

    private String description;

    private Long saleableInventory;

    private Long frozenInventory;

    private String identifier;

    private NFTState state;

    private LocalDateTime saleTime;

    private LocalDateTime syncChainTime;

}
