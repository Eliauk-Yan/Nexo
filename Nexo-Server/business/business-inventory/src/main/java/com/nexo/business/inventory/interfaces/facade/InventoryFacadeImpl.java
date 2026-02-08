package com.nexo.business.inventory.interfaces.facade;

import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;
import com.nexo.common.api.common.response.ResponseCode;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.product.response.data.ProductInventoryDTO;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * @classname InventoryFacadeImpl
 * @description 库存模块Dubbo服务实现类
 * @date 2026/02/08 00:17
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class InventoryFacadeImpl implements InventoryFacade {

    @DubboReference(version = "1.0.0")
    private ArtWorkFacade artWorkFacade;

    @Override
    public InventoryResponse<ProductInventoryDTO> getProductInventory(String productId, ProductType productType) {
        return switch (productType) {
            case ARTWORK -> {
                ArtWorkQueryResponse<ArtworkInventoryDTO> response = artWorkFacade.getArtworkInventory(Long.parseLong(productId));
                if (response.getSuccess()) {
                    InventoryResponse<ProductInventoryDTO> inventoryResponse = new InventoryResponse<>();
                    inventoryResponse.setSuccess(true);
                    inventoryResponse.setCode(ResponseCode.SUCCESS.name());
                    inventoryResponse.setMessage(ResponseCode.SUCCESS.getMessage());
                    inventoryResponse.setData(response.getData());
                    yield inventoryResponse;
                }
                yield null;
            }
            case BLIND_BOX -> null;
        };
    }

    @Override
    public InventoryResponse<String> getInventoryDecreaseStream(InventoryRequest inventoryRequest) {
        return switch (inventoryRequest.getProductType()) {
            case ARTWORK -> {
                ArtWorkQueryResponse<ArtworkInventoryDTO> response = artWorkFacade.getArtworkInventory(Long.parseLong(productId));
                if (response.getSuccess()) {
                    InventoryResponse<ProductInventoryDTO> inventoryResponse = new InventoryResponse<>();
                    inventoryResponse.setSuccess(true);
                    inventoryResponse.setCode(ResponseCode.SUCCESS.name());
                    inventoryResponse.setMessage(ResponseCode.SUCCESS.getMessage());
                    inventoryResponse.setData(response.getData());
                    yield inventoryResponse;
                }
                yield null;
            }
            case BLIND_BOX -> null;
        };
    }


}
