package com.nexo.common.api.product.response.data;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname ProductInventoryDTO
 * @description 商品库存数据
 * @date 2026/02/08 01:38
 */
public abstract class ProductInventoryDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 可售库存
     */
    public abstract Long getInventory();

    /**
     * 库存总量
     */
    public abstract Long getQuantity();

}
