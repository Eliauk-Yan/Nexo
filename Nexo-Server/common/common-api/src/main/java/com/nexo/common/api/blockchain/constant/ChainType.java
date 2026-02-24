package com.nexo.common.api.blockchain.constant;


import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ChainType {

    MOCK("MOCK", "模拟");

    @EnumValue
    private final String code;

    private final String desc;

}
