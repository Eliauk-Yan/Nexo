package com.nexo.business.collection.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.nft.constant.AssetState;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname Asset
 * @description 资产表
 * @date 2025/12/20 12:47
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("assets")
public class Asset extends BaseEntity {

    private Long nftId;

    private BigDecimal purchasePrice;

    private String serialNumber;

    private String nftIdentifier;

    private Long previousHolderId;

    private Long currentHolderId;

    private AssetState state;

    private String transactionHash;

    private BigDecimal referencePrice;

    private String rarity;

    private LocalDateTime syncChainTime;

    private LocalDateTime destructionTime;

    private String businessNo;

    private String businessType;

    // 资产初始化
    public void init() {

    }

    // 资产激活
    public void active(String transactionHash) {
        this.transactionHash = transactionHash;
        this.syncChainTime = LocalDateTime.now();
        this.state = AssetState.ACTIVE;
    }

    /**
     * 销毁中
     */
    public void destroying() {
        this.state = AssetState.DESTROYING;
        this.destructionTime = LocalDateTime.now();
    }

    /**
     * 已销毁
     */
    public void destroyed() {
        this.state = AssetState.DESTROYED;
        this.destructionTime = LocalDateTime.now();
    }

}
