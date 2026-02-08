package com.nexo.common.api.artwork.response.data;

import com.nexo.common.api.product.response.data.ProductInventoryDTO;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname ArtworkInventoryDTO
 * @description 藏品库存数据
 * @date 2026/02/08 01:38
 */
@Getter
@Setter
public class ArtworkInventoryDTO extends ProductInventoryDTO {

    /**
     * 可售库存
     */
    private Long saleableInventory;

    /**
     * 藏品数量
     */
    private Long quantity;

    @Override
    public Long getInventory() {
        return this.saleableInventory;
    }

    @Override
    public Long getQuantity() {
        return this.quantity;
    }
}
