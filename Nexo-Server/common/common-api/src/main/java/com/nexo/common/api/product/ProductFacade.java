package com.nexo.common.api.product;

import com.nexo.common.api.product.constant.ProductEvent;
import com.nexo.common.api.product.constant.ProductType;
import com.nexo.common.api.product.request.ProductSaleRequest;
import com.nexo.common.api.product.response.ProductResponse;
import com.nexo.common.api.product.response.data.ProductDTO;
import com.nexo.common.api.product.response.data.ProductIventoryStreamDTO;
import com.nexo.common.api.product.response.data.ProductSaleDTO;

import java.util.List;

/**
 * 商品Dubbo接口
 */
public interface ProductFacade {

    /**
     * 获取商品信息
     * @param productId 商品ID
     * @param productType 商品类型
     * @return 商品信息
     */
    ProductResponse<ProductDTO> getProduct(String productId, ProductType productType);

    /**
     * 获取商品库存流水信息
     * @param productId 商品ID
     * @param productType 商品类型
     * @param productEvent 商品事件
     * @param identifier 幂等号
     * @return 商品库存流水信息
     */
    ProductResponse<ProductIventoryStreamDTO> getProductInventoryStream(String productId, ProductType productType, ProductEvent productEvent, String identifier);

    /**
     * 商品售卖
     * @param saleRequest 商品售卖请求
     * @return 商品售卖响应
     */
    ProductResponse<ProductSaleDTO> sale(ProductSaleRequest saleRequest);
}
