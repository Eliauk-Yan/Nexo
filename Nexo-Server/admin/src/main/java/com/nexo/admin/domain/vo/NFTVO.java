package com.nexo.admin.domain.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.nexo.common.api.artwork.constant.ArtWorkState;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname NFTVO
 * @description NFT
 * @date 2026/02/20 10:05
 */
@Getter
@Setter
public class NFTVO {

    private Long id;

    private String name;

    private String cover;

    private BigDecimal price;

    private Long quantity;

    private String description;

    private Long saleableInventory;

    private Long frozenInventory;

    private ArtWorkState state;

    private LocalDateTime saleTime;

    private LocalDateTime syncChainTime;

    private LocalDateTime bookStartTime;

    private LocalDateTime bookEndTime;

    private Boolean canBook;

    private Long creatorId;

}
