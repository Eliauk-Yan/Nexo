package com.nexo.business.trade.interfaces.dto;

import com.nexo.common.api.product.constant.ProductType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname BuyDTO
 * @description 下单参数
 * @date 2026/02/03 00:07
 */
@Getter
@Setter
public class BuyDTO {

    /**
     * 商品ID
     */
    @NotNull(message = "商品ID不能为空")
    private String productId;

    /**
     * 商品类型
     */
    @NotNull(message = "商品类型不能为空")
    private ProductType productType;

    /**
     * 商品数量
     */
    @Min(value = 1)
    private Long itemCount;

}
