package com.nexo.common.api.product.constant;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProductType {

    ARTWORK("ARTWORK", "藏品"),

    BLIND_BOX("BLIND_BOX", "盲盒");

    @JsonValue
    private final String code;

    private final String description;

}
