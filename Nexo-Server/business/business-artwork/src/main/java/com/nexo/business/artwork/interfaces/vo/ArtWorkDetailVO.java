package com.nexo.business.artwork.interfaces.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * @classname ArtWorkDetailVO
 * @description 数字藏品详情 VO
 * @date 2025/12/23 22:47
 */
@Data
public class ArtWorkDetailVO {

    private Long id;

    private String name;

    private String cover;

    private BigDecimal price;

    private Long quantity;

    private Long inventory;

    private Date saleTime;

    private Integer version;

    private Date bookStartTime;

    private Date bookEndTime;

    private Boolean canBook;

    private Boolean hasBooked;


}
