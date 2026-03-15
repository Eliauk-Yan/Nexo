package com.nexo.common.api.inventory;

import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.product.response.data.ProductInventoryDTO;

public interface InventoryFacade {

    /**
     * 获取商品库存信息
     * 
     * @param productId   商品ID
     * @param NFTType 商品类型
     * @return 商品库存信息
     */
    InventoryResponse<ProductInventoryDTO> getInventory(String productId, NFTType NFTType);

    /**
     * 获取库存扣减日志 TODO 参数待优化暂时耦合
     * 
     * @param request 请求
     * @return 库存扣减日志
     */
    InventoryResponse<String> getInventoryDecreaseLog(OrderCreateRequest request);

    /**
     * 获取库存增加日志 TODO 参数待优化暂时耦合
     * 
     * @param orderCreateRequest 请求
     * @return 库存增加日志
     */
    InventoryResponse<String> getInventoryIncreaseLog(OrderCreateRequest orderCreateRequest);

    /**
     * 删除库存扣减日志 TODO 参数待优化暂时耦合
     */
    InventoryResponse<Long> removeInventoryDecreaseLog(OrderCreateRequest orderCreateRequest);

    /**
     * 初始化库存
     */
    InventoryResponse<Boolean> init(InventoryRequest inventoryRequest);

    /**
     * 获取Redis中的库存
     */
    InventoryResponse<Long> getInventory(InventoryRequest inventoryRequest);

    /**
     * 库存失效
     */
    InventoryResponse<Boolean> invalid(InventoryRequest inventoryRequest);

    /**
     * 扣减库存
     */
    InventoryResponse<Boolean> decreaseInventory(InventoryRequest request);

    /**
     * 增加库存
     */
    InventoryResponse<Boolean> increaseInventory(InventoryRequest request);
}
