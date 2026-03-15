package com.nexo.common.base.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ResponseCode {

    SUCCESS("SUCCESS", "成功"),

    FAIL("FAIL", "失败"),

    DUPLICATED("DUPLICATED", "重复"),

    ILLEGAL_ARGUMENT("ILLEGAL_ARGUMENT", "非法参数"),

    SYSTEM_ERROR("SYSTEM_ERROR", "系统错误"),

    BIZ_ERROR("BIZ_ERROR", "业务错误");

    private final String code;

    private final String message;

}
