package com.nexo.common.api.nft.response.data;

import com.nexo.common.api.nft.constant.ProductState;
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
public class NFTInfo implements Serializable {

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
     * NFT 状态
     */
    private ProductState productState;


}
