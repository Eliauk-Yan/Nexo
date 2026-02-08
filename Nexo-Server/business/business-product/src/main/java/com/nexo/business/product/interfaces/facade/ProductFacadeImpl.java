package com.nexo.business.product.interfaces.facade;

import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import com.nexo.common.api.artwork.response.data.ArtworkStreamDTO;
import com.nexo.common.api.common.response.ResponseCode;
import com.nexo.common.api.product.ProductFacade;
import com.nexo.common.api.product.constant.ProductEvent;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.product.response.ProductResponse;
import com.nexo.common.api.product.response.data.ProductDTO;
import com.nexo.common.api.product.response.data.ProductStreamDTO;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * @classname ProductFacadeImpl
 * @description 商品Dubbo实服务实现类
 * @date 2026/02/07 01:15
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class ProductFacadeImpl implements ProductFacade {

    @DubboReference(version = "1.0.0")
    private ArtWorkFacade artWorkFacade;

    @Override
    public ProductResponse<ProductDTO> getProduct(String productId, ProductType productType) {
        return switch (productType) {
            case ARTWORK -> {
                ArtWorkQueryResponse<ArtWorkDTO> response = artWorkFacade.getArtWorkById(Long.parseLong(productId));
                if (response.getSuccess()) {
                    ProductResponse<ProductDTO> productResponse = new ProductResponse<>();
                    productResponse.setSuccess(true);
                    productResponse.setCode(ResponseCode.SUCCESS.name());
                    productResponse.setMessage(ResponseCode.SUCCESS.getMessage());
                    productResponse.setData(response.getData());
                    yield productResponse;
                }
                yield null;
            }
            case BLIND_BOX -> null;
        };
    }

    @Override
    public ProductResponse<ProductStreamDTO> getProductInventoryStream(String productId, ProductType productType, ProductEvent productEvent, String identifier) {
        return switch (productType) {
            case ARTWORK -> {
                // 1. 获取藏品库存流水数据
                ArtworkStreamDTO artworkInventoryStream = artWorkFacade.getArtworkInventoryStream(Long.parseLong(productId), productType, productEvent, identifier);
                // 2. 构造响应体并返回
                ProductResponse<ProductStreamDTO> productResponse = new ProductResponse<>();
                productResponse.setSuccess(true);
                productResponse.setCode(ResponseCode.SUCCESS.name());
                productResponse.setMessage(ResponseCode.SUCCESS.getMessage());
                productResponse.setData(artworkInventoryStream);
                yield productResponse;
            }
            case BLIND_BOX -> null;
        };
    }
}
