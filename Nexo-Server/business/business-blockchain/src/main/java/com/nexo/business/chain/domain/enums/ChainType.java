package com.nexo.business.chain.domain.enums;


import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ChainType {

    MOCK("MOCK", "模拟"),

    WEN_CHANG("WEN_CHANG", "文昌链");

    @EnumValue
    private final String code;

    private final String desc;

}
