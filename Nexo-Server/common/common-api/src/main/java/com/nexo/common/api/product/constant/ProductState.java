package com.nexo.common.api.product.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 商品状态枚举
 */
@Getter
@AllArgsConstructor
public enum ProductState {

    /**
     * 当前状态非可售卖
     */
    NOT_FOR_SALE("NOT_FOR_SALE", "不可售卖"),

    /**
     * 当前状态是可售卖，并且到达开售时间，并且有库存
     */
    SELLING("SELLING", "售卖中"),

    /**
     * 当前状态是可售卖，并且到达开售时间，但是没有库存
     */
    SOLD_OUT("SOLD_OUT", "售空"),

    /**
     * 当前状态是可售卖，并且有库存，但是到达开售时间，且距离开售时间小于1天
     */
    COMING_SOON("COMING_SOON", "即将开售"),

    /**
     * 当前状态是可售卖，并且有库存，但是到达开售时间，且距离开售时间大于1天
     */
    WAIT_FOR_SALE("WAIT_FOR_SALE", "等待开售");

    private final String code;

    private final String description;
}
