package com.nexo.common.api.inventory.request;

import com.nexo.common.api.common.request.BaseRequest;
import com.nexo.common.api.product.constant.ProductType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname InventoryRequest
 * @description 库存模块Dubbo请求
 * @date 2026/02/08 02:43
 */
@Getter
@Setter
public class InventoryRequest extends BaseRequest {

    /**
     * 商品ID
     */
    @NotNull(message = "商品为空")
    private String productId;

    /**
     * 商品类型
     */
    @NotNull(message = "商品类型为空")
    private ProductType productType;

    /**
     * 幂等号：唯一标识
     */
    private String identifier;

    /**
     * 库存数量
     */
    private Long inventory;

}
