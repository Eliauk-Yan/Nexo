package com.nexo.common.api.product.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 商品售卖业务类型
 */
@AllArgsConstructor
@Getter
public enum ProductSaleBizType {

    PRIMARY_TRADE("PRIMARY_TRADE", "一级市场交易"),

    TRANSFER("TRANSFER", "转赠"),;

    private final String code;

    private final String description;

}
