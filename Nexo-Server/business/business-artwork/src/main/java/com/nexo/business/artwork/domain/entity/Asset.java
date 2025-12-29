package com.nexo.business.artwork.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.business.artwork.domain.enums.AssetState;
import com.nexo.common.datasource.domain.entity.BaseEntity;
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

    @TableField(value = "artwork_id")
    private Long artWorkId;

    @TableField(value = "purchase_price")
    private BigDecimal purchasePrice;

    @TableField(value = "serial_number")
    private String serialNumber;

    @TableField(value = "nft_identifier")
    private String nftIdentifier;

    @TableField(value = "previous_holder_id")
    private Long previousHolderId;

    @TableField(value = "current_holder_id")
    private Long currentHolderId;

    @TableField(value = "state")
    private AssetState state;

    @TableField(value = "transaction_hash")
    private String transactionHash;

    @TableField(value = "reference_price")
    private BigDecimal referencePrice;

    @TableField(value = "rarity")
    private String rarity;

    @TableField(value = "sync_chain_time")
    private LocalDateTime syncChainTime;

    @TableField(value = "destruction_time")
    private LocalDateTime destructionTime;

    @TableField(value = "business_no")
    private String businessNo;

    @TableField(value = "business_type")
    private String businessType;

}
