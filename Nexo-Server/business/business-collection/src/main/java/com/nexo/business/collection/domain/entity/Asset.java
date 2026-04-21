package com.nexo.business.collection.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.nft.constant.AssetState;
import com.nexo.common.api.nft.constant.ProductSaleBizType;
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

    /**
     * 藏品ID
     */
    private Long nftId;

    /**
     * 购买价格
     */
    private BigDecimal purchasePrice;

    /**
     * 藏品编号
     */
    private String serialNumber;

    /**
     * 藏品唯一编号
     */
    private String nftIdentifier;

    /**
     * 上一个持有人ID
     */
    private Long previousHolderId;

    /**
     * 当前持有人ID
     */
    private Long currentHolderId;

    /**
     * 资产状态
     */
    private AssetState state;

    /**
     * 交易Hash
     */
    private String transactionHash;

    /**
     * 参考价格
     */
    private BigDecimal referencePrice;

    /**
     * 稀有度
     */
    private String rarity;

    /**
     * 链同步时间
     */
    private LocalDateTime syncChainTime;

    /**
     * 销毁时间
     */
    private LocalDateTime destroyTime;

    /**
     * 持有时间
     */
    private LocalDateTime holdTime;

    /**
     * 业务编号
     */
    private String businessNo;

    /**
     * 业务类型
     */
    private ProductSaleBizType businessType;

    // 资产初始化
    public void init() {

    }

    // 资产激活
    public void active(String transactionHash, String nftIdentifier) {
        this.transactionHash = transactionHash;
        this.nftIdentifier = nftIdentifier;
        this.syncChainTime = LocalDateTime.now();
        this.state = AssetState.ACTIVE;
    }

    /**
     * 资产失效
     */
    public void inactive() {
        this.state = AssetState.INACTIVE;
    }

    /**
     * 销毁中
     */
    public void destroying() {
        this.state = AssetState.DESTROYING;
        this.destroyTime = LocalDateTime.now();
    }

    /**
     * 已销毁
     */
    public void destroyed() {
        this.state = AssetState.DESTROYED;
        this.destroyTime = LocalDateTime.now();
    }

}
