package com.nexo.common.api.nft.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum NFTInventoryUpdateType {

    UNMODIFIED("UNMODIFIED", "未修改"),

    INCREASE("INCREASE", "增加库存"),

    DECREASE("DECREASE", "减少库存");

    private final String code;

    private final String description;
}
