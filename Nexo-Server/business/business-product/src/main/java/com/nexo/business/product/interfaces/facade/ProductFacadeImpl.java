package com.nexo.business.product.interfaces.facade;

import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryStreamDTO;
import com.nexo.common.api.common.response.ResponseCode;
import com.nexo.common.api.product.ProductFacade;
import com.nexo.common.api.product.constant.ProductEvent;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.product.request.ProductSaleRequest;
import com.nexo.common.api.product.response.ProductResponse;
import com.nexo.common.api.product.response.data.ProductInventoryStreamDTO;
import com.nexo.common.api.product.response.data.ProductSaleDTO;
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
    public ProductResponse<ProductInventoryStreamDTO> getProductInventoryStream(String productId, ProductType productType, ProductEvent productEvent, String identifier) {
        return switch (productType) {
            case ARTWORK -> {
                // 1. 获取藏品库存流水数据 TODO
                ArtworkInventoryStreamDTO artworkInventoryStream = artWorkFacade.getArtworkInventoryStream(Long.parseLong(productId), identifier);
                // 2. 构造响应体并返回
                ProductResponse<ProductInventoryStreamDTO> productResponse = new ProductResponse<>();
                productResponse.setSuccess(true);
                productResponse.setCode(ResponseCode.SUCCESS.name());
                productResponse.setMessage(ResponseCode.SUCCESS.getMessage());
                productResponse.setData(artworkInventoryStream);
                yield productResponse;
            }
            case BLIND_BOX -> null;
        };
    }

    @Override
    public ProductResponse<ProductSaleDTO> sale(ProductSaleRequest saleRequest) {
        // TODO 后续优化为模板那方法模式
        ProductResponse<ProductSaleDTO> response = new ProductResponse<>();
        if (saleRequest.getProductType() == ProductType.ARTWORK) {
            Boolean trySaleResult =  artWorkFacade.sale(saleRequest);
            response.setSuccess(trySaleResult);
            return response;
        } else {
            throw new UnsupportedOperationException("不支持商品类型");
        }
    }
}
