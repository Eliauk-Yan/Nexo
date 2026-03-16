package com.nexo.business.order.domain.validator;

import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.order.request.OrderCreateRequest;
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
        InventoryRequest inventoryRequest = new InventoryRequest();
        inventoryRequest.setNftId(request.getProductId());
        inventoryRequest.setNFTType(request.getNFTType());
        InventoryResponse<Long> response = inventoryFacade.getInventory(inventoryRequest);
        Long inventory = response.getData();
        // 2. 判断库存是否充足
        if (inventory == null || inventory == 0 || inventory < request.getItemCount()) {
            throw new OrderException(INVENTORY_NOT_ENOUGH);
        }
    }
}
