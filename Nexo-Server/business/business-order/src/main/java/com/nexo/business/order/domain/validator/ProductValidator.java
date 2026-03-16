package com.nexo.business.order.domain.validator;

import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.constant.ProductState;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.nft.response.data.NFTInfo;
import com.nexo.common.api.order.request.OrderCreateRequest;
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

    private final NFTFacade nftFacade;

    @Override
    protected void doValidate(OrderCreateRequest request) throws OrderException {
        // 1. 调用商品服务获取商品信息
        NFTResponse<NFTInfo> response = nftFacade.getNFTInfoById(Long.parseLong(request.getProductId()));
        NFTInfo data = response.getData();
        // 2. 判断商品是否可用
        if (data.getProductState() != ProductState.SELLING) {
            throw new OrderException(PRODUCT_NOT_AVAILABLE);
        }
        // 3. 判断商品价格是否变化
        if (data.getPrice().compareTo(request.getItemPrice()) != 0) {
            throw new OrderException(PRODUCT_PRICE_CHANGED);
        }
    }

}
