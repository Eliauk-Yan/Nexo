package com.nexo.common.api.inventory;

import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;

public interface InventoryFacade {

    /**
     * 初始化库存
     */
    InventoryResponse<Boolean> init(InventoryRequest inventoryRequest);

    /**
     * 获取Redis中的库存
     */
    InventoryResponse<Long> getInventory(InventoryRequest inventoryRequest);

    /**
     * 库存Redis失效
     */
    InventoryResponse<Boolean> invalid(InventoryRequest inventoryRequest);

    /**
     * 扣减Redis库存
     */
    InventoryResponse<Boolean> decreaseInventory(InventoryRequest request);

    /**
     * 增加Redis库存
     */
    InventoryResponse<Boolean> increaseInventory(InventoryRequest request);

    /**
     * 获取Redis库存扣减流水
     */
    InventoryResponse<String> getInventoryDecreaseLog(InventoryRequest request);

    /**
     * 获取Redis库存增加流水
     */
    InventoryResponse<String> getInventoryIncreaseLog(InventoryRequest request);

    /**
     * 删除Redis库存扣减日志
     */
    InventoryResponse<Long> removeInventoryDecreaseLog(InventoryRequest request);
}
