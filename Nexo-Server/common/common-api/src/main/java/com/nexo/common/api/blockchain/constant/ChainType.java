package com.nexo.common.api.blockchain.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ChainType {

    MOCK("MOCK", "模拟");

    private final String code;

    private final String desc;

}
