package com.nexo.business.collection.interfaces.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * @classname ArtWorkVO
 * @description 艺术藏品视图对象
 * @date 2025/12/21 17:09
 */
@Data
public class NFTVO {

    private Long id;

    private String name;

    private String cover;

    private String classify;

    private String source;

    private BigDecimal price;

    private Long quantity;

    private Long inventory;

    private BigDecimal heat;

    private String description;

}
