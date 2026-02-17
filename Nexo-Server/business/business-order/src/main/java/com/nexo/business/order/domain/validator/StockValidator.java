package com.nexo.business.order.domain.validator;

import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.product.response.data.ProductInventoryDTO;
import lombok.RequiredArgsConstructor;

import static com.nexo.business.order.domain.exception.OrderErrorCode.INVENTORY_NOT_ENOUGH;

/**
 * @classname StockValidator
 * @description 库存校验器
 * @date 2026/02/07 18:36
 */
@RequiredArgsConstructor
public class StockValidator extends BaseOrderCreateValidator {

    private final InventoryFacade inventoryFacade;

    @Override
    protected void doValidate(OrderCreateRequest request) throws OrderException {
        // 1. 查询商品库存信息
        InventoryResponse<ProductInventoryDTO> response = inventoryFacade.getInventory(request.getProductId(),
                request.getProductType());
        ProductInventoryDTO inventoryDTO = response.getData();
        // 2. 判断库存是否充足
        if (inventoryDTO == null || inventoryDTO.getInventory() == 0
                || inventoryDTO.getQuantity() < request.getItemCount()
                || inventoryDTO.getInventory() < request.getItemCount()) {
            throw new OrderException(INVENTORY_NOT_ENOUGH);
        }
    }

}
