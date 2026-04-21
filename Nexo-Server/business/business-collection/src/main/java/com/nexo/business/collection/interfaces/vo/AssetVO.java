package com.nexo.business.collection.interfaces.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname AssetVO
 * @description 个人资产
 * @date 2026/03/08
 */
@Data
public class AssetVO {

    /**
     * 资产ID
     */
    private Long id;

    /**
     * 所属藏品ID
     */
    private Long nftId;

    /**
     * 藏品名称
     */
    private String nftName;

    /**
     * 藏品封面图
     */
    private String nftCover;

    /**
     * 购入价格
     */
    private BigDecimal purchasePrice;

    /**
     * 资产唯一编号 (区块链/系统流浪序号)
     */
    private String serialNumber;

    /**
     * 资产状态
     */
    private String state;

    /**
     * 上链交易哈希
     */
    private String transactionHash;

    /**
     * 创建(获取)时间
     */
    private LocalDateTime createdAt;
}
