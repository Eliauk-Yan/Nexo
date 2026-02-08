package com.nexo.common.api.product.response.data;

import lombok.Getter;
import lombok.Setter;


/**
 * @classname ProductStreamDTO
 * @description 商品流水数据
 * @date 2026/02/08 17:18
 */
@Getter
@Setter
public abstract class ProductStreamDTO {

    /**
     * '变更数量'
     */
    private Long changedQuantity;


}
