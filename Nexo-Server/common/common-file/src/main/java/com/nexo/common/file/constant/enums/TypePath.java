package com.nexo.common.file.constant.enums;


import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname FileType
 * @description 文件类型枚举
 * @date 2025/12/24 15:13
 */
@AllArgsConstructor
@Getter
public enum TypePath {

    IMAGE("IMAGE", "image"),

    VIDEO("VIDEO", "video"),

    AUDIO("AUDIO", "audio"),

    DOCUMENT("DOCUMENT", "document"),

    OTHER("OTHER", "other");

    private final String code;

    private final String url;

}
