package com.nexo.business.blockchain.constant.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 链类型枚举
 */
@Getter
@AllArgsConstructor
public enum ChainOperationState {

    INIT("INIT", "初始化"),

    PROCESSING("PROCESSING", "处理中"),

    SUCCESS("SUCCESS", "成功"),

    FAILED("FAILED", "失败");

    private final String code;

    private final String desc;
}