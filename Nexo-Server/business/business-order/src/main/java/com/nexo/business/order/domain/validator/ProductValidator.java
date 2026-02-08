package com.nexo.business.order.domain.validator;

import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.product.ProductFacade;
import com.nexo.common.api.product.response.ProductResponse;
import com.nexo.common.api.product.response.data.ProductDTO;
import lombok.RequiredArgsConstructor;

import static com.nexo.business.order.domain.exception.OrderErrorCode.PRODUCT_NOT_AVAILABLE;
import static com.nexo.business.order.domain.exception.OrderErrorCode.PRODUCT_PRICE_CHANGED;

/**
 * @classname ProductValidator
 * @description 商品校验器
 * @date 2026/02/07 18:34
 */
@RequiredArgsConstructor
public class ProductValidator extends BaseOrderCreateValidator {

    private final ProductFacade productFacade;

    @Override
    protected void doValidate(OrderCreateRequest request) throws OrderException {
        // 1. 调用商品服务获取商品信息
        ProductResponse<ProductDTO> response = productFacade.getProduct(request.getProductId(), request.getProductType());
        ProductDTO productDTO = response.getData();
        // 2. 判断商品是否可用
        if (!productDTO.available()) {
            throw new OrderException(PRODUCT_NOT_AVAILABLE);
        }
        // 3. 判断商品价格是否变化
        if (productDTO.getPrice().compareTo(request.getItemPrice()) != 0) {
            throw new OrderException(PRODUCT_PRICE_CHANGED);
        }
    }

}
