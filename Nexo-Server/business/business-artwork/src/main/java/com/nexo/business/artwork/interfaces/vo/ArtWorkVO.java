package com.nexo.business.artwork.interfaces.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * @classname ArtWorkVO
 * @description 艺术藏品视图对象
 * @date 2025/12/21 17:09
 */
@Data
public class ArtWorkVO {

    private Long id;

    private String name;

    private String cover;

    private BigDecimal price;

    private Long quantity;

    private Long inventory;

}
