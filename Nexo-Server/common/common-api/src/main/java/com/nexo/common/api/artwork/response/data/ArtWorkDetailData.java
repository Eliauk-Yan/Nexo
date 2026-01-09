package com.nexo.common.api.artwork.response.data;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * @classname ArtWorkDetailData
 * @description 藏品详情数据
 * @date 2026/01/09 10:31
 */
@Data
public class ArtWorkDetailData implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

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
