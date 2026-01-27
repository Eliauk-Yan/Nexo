package com.nexo.business.product.artwork.interfaces.dto;

import lombok.Data;

/**
 * @classname ArtWorkQueryDTO
 * @description 藏品查询参数
 * @date 2025/12/21 17:21
 */
@Data
public class ArtWorkQueryDTO {

    private String keyword;

    private int pageSize;

    private int currentPage;

}
