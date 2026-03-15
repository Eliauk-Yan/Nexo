package com.nexo.common.api.nft.response.data;

import com.nexo.common.api.nft.constant.NFTState;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

import java.time.LocalDateTime;

/**
 * @classname ArtWorkDetailData
 * @description 藏品详情数据
 * @date 2026/01/09 10:31
 */
@Getter
@Setter
public class NFTDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String name;

    private String cover;

    private BigDecimal price;

    private String description;

    private Long quantity;

    private Long saleableInventory;

    private Long frozenInventory;

    private LocalDateTime saleTime;

    private Integer version;

    private NFTState state;

    private LocalDateTime syncChainTime;

    private LocalDateTime createdAt;

}
