package com.nexo.business.artwork.domain.entity;

import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname ArtworkSnapshot
 * @description 藏品快照 每一个藏品的核心信息的修改，如价格修改，图片修改等，都会生成一个新的版本，并记录一个快照，用于订单记录快照版本号，方便回溯当时下单时的藏品相关信息。
 * @date 2026/02/24 00:46
 */
@Getter
@Setter
public class ArtworkSnapshot extends BaseEntity {

    private Long artworkId;

    private String name;

    private String cover;

    private String classId;

    private BigDecimal price;

    private Long quantity;

    private String description;

    private Long saleableInventory;

    private LocalDateTime saleTime;

    private LocalDateTime syncChainTime;

    private Long creatorId;

    private Long updateVersion;

    private LocalDateTime createTime;

}
