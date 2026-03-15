package com.nexo.business.collection.interfaces.vo;

import com.nexo.common.api.artwork.constant.ProductState;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname NFTDetailVO
 * @description 数字藏品详情 VO
 * @date 2025/12/23 22:47
 */
@Data
public class NFTDetailVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;


    /**
     * NFT ID
     */
    private Long id;

    /**
     * NFT 名称
     */
    private String name;

    /**
     * NFT 封面
     */
    private String cover;

    /**
     * NFT 价格
     */
    private BigDecimal price;

    /**
     * NFT 数量
     */
    private Long quantity;

    /**
     * NFT 库存
     */
    private Long inventory;

    /**
     * NFT 发售时间
     */
    private LocalDateTime saleTime;

    /**
     * NFT 版本
     */
    private Integer version;

    /**
     * NFT 预约开始时间
     */
    private LocalDateTime bookStartTime;

    /**
     * NFT 预约结束时间
     */
    private LocalDateTime bookEndTime;

    /**
     * NFT 是否可预约
     */
    private Boolean canBook;

    /**
     * NFT 是否已预约
     */
    private Boolean hasBooked;

    /**
     * NFT 状态
     */
    private ProductState productState;


}
