package com.nexo.common.api.inventory;

import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.product.response.data.ProductInventoryDTO;

public interface InventoryFacade {

    /**
     * 获取商品库存信息
     * 
     * @param productId   商品ID
     * @param productType 商品类型
     * @return 商品库存信息
     */
    InventoryResponse<ProductInventoryDTO> getProductInventory(String productId, ProductType productType);

    /**
     * 查询库存并扣减流水
     * @param inventoryRequest 库存请求
     * @return 流水JSON
     */
    InventoryResponse<String> getInventoryDecreaseStream(InventoryRequest inventoryRequest);

}
