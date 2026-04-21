package com.nexo.common.api.nft.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum AssetState {

    INIT("INIT", "初始化"),

    ACTIVE("ACTIVE", "激活"),

    INACTIVE("INACTIVE", "失效"),

    DESTROYING("DESTROYING", "销毁中"),

    DESTROYED("DESTROYED", "已销毁");

    private final String code;

    private final String description;

}
