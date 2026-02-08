package com.nexo.common.api.product.response.data;

/**
 * @classname ProductInventoryDTO
 * @description 商品库存数据
 * @date 2026/02/08 01:38
 */
public abstract class ProductInventoryDTO {

    /**
     * 可售库存
     */
    public abstract Long getInventory();

    /**
     * 库存总量
     */
    public abstract Long getQuantity();

}
