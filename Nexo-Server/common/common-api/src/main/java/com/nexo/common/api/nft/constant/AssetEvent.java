package com.nexo.common.api.nft.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum AssetEvent {

    CREATE("CREATE", "创建"),

    ACTIVE("ACTIVE", "激活"),

    TRANSFER("TRANSFER", "转让"),

    DESTROY("DESTROY", "销毁");

    private final String code;

    private final String message;
}
