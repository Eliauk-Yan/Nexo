package com.nexo.common.api.product;

import com.nexo.common.api.nft.constant.NFTEvent;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.product.request.ProductSaleRequest;
import com.nexo.common.api.product.response.ProductResponse;
import com.nexo.common.api.product.response.data.ProductInventoryStreamDTO;
import com.nexo.common.api.product.response.data.ProductSaleDTO;

/**
 * 商品Dubbo接口
 */
public interface ProductFacade {

    /**
     * 获取商品库存流水信息
     * 
     * @param productId    商品ID
     * @param NFTType  商品类型
     * @param NFTEvent 商品事件
     * @param identifier   幂等号
     * @return 商品库存流水信息
     */
    ProductResponse<ProductInventoryStreamDTO> getProductInventoryStream(String productId, NFTType NFTType,
                                                                         NFTEvent NFTEvent, String identifier);

    /**
     * 商品售卖
     * 
     * @param saleRequest 商品售卖请求
     * @return 商品售卖响应
     */
    ProductResponse<ProductSaleDTO> sale(ProductSaleRequest saleRequest);

    /**
     * 取消售卖 (回滚库存)
     * 
     * @param saleRequest 商品售卖请求
     * @return 商品回复响应
     */
    ProductResponse<ProductSaleDTO> unsale(ProductSaleRequest saleRequest);
}
