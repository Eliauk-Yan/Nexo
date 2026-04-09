package com.nexo.business.collection.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.nft.constant.NFTState;
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

    // 状态机方法
    // 初始化
    public void init(String name, String cover, BigDecimal price, Long quantity, LocalDateTime saleTime, String description) {
        this.name = name;
        this.cover = cover;
        this.price = price;
        this.quantity = quantity;
        this.saleTime = saleTime;
        this.description = description;
        this.setSaleableInventory(quantity);
        this.setFrozenInventory(0L);
        this.setState(NFTState.PENDING);
    }

    // 成功
    public void success() {
        this.state = NFTState.SUCCESS;
        this.saleTime = LocalDateTime.now();
    }

    // 下架
    public void archived() {
        this.state = NFTState.ARCHIVED;
    }

}
