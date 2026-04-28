package com.nexo.business.collection.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.nft.constant.NFTState;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

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

    private String classify;

    private String source;

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
    public void init(String name, String cover, String classify, String source, BigDecimal price, Long quantity, LocalDateTime saleTime, String description) {
        this.name = name;
        this.cover = cover;
        this.classify = classify;
        this.source = source;
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
        this.syncChainTime = LocalDateTime.now();
    }

    // 下架
    public void archived() {
        this.state = NFTState.ARCHIVED;
    }

    /**
     * 最终热度 = (已售数量 * 20 + 售罄率 * 100) / (1 + 上架天数 * 0.15)
     */
    public BigDecimal heat() {
        // 1. 校验数据
        if (quantity == null || quantity <= 0) {
            return BigDecimal.ZERO;
        }
        long saleable = saleableInventory == null ? quantity : saleableInventory;
        // 2. 已售数量
        long soldQuantity = Math.max(quantity - saleable, 0L);
        // 3. 售罄率 = 已售数量 / 总库存 （结果保留 4 位小数 标注四舍五入模式）
        BigDecimal soldOutRate = BigDecimal.valueOf(soldQuantity).divide(BigDecimal.valueOf(quantity), 4, RoundingMode.HALF_UP);
        // 4. 计算上架天数
        long saleDays = 0L;
        if (saleTime != null) {
            saleDays = Math.max(ChronoUnit.DAYS.between(saleTime, LocalDateTime.now()), 0L);
        }
        // 分子
        BigDecimal numerator = BigDecimal.valueOf(soldQuantity)
                .multiply(BigDecimal.valueOf(20))
                .add(soldOutRate.multiply(BigDecimal.valueOf(100)));
        // 分母
        BigDecimal denominator = BigDecimal.ONE.add(BigDecimal.valueOf(saleDays).multiply(BigDecimal.valueOf(0.15)));
        // 结果
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

}
