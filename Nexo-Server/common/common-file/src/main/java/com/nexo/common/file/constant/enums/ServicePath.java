package com.nexo.common.file.constant.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname FileURL
 * @description 各个模块文件路径枚举
 * @date 2025/12/24 15:12
 */
@Getter
@AllArgsConstructor
public enum ServicePath {

    USER("USER", "user");

    private final String code;

    private final String url;
}
