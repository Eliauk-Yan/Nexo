package com.nexo.common.api.artwork.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum NFTState {


    PENDING("PENDING", "未处理"),

    SUCCESS("SUCCESS", "上链成功"),

    ARCHIVED("ARCHIVED", "已下架");

    private final String code;

    private final String description;
}
