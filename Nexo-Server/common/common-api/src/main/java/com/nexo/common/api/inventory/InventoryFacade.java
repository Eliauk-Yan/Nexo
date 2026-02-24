package com.nexo.common.api.inventory;

import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.order.request.OrderCreateRequest;
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
    InventoryResponse<ProductInventoryDTO> getInventory(String productId, ProductType productType);

    /**
     * 扣减库存 TODO 参数待优化暂时耦合
     * @param request 请求
     * @return 返回结果
     */
    InventoryResponse<Boolean> decreaseInventory(OrderCreateRequest request);

    /**
     * 获取库存扣减日志 TODO 参数待优化暂时耦合
     * @param request 请求
     * @return 库存扣减日志
     */
    InventoryResponse<String> getInventoryDecreaseLog(OrderCreateRequest request);

    /**
     * 获取库存增加日志 TODO 参数待优化暂时耦合
     * @param orderCreateRequest 请求
      * @return 库存增加日志
     */
    InventoryResponse<String> getInventoryIncreaseLog(OrderCreateRequest orderCreateRequest);

    /**
     * 删除库存扣减日志 TODO 参数待优化暂时耦合
      * @param orderCreateRequest 请求
      * @return 删除结果
     */
    InventoryResponse<Long> removeInventoryDecreaseLog(OrderCreateRequest orderCreateRequest);

    /**
     * 初始化库存
     * @param inventoryRequest 库存请求
      * @return 初始化结果
     */
    InventoryResponse<Boolean> init(InventoryRequest inventoryRequest);
}
