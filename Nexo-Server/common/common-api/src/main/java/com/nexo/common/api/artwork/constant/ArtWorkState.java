package com.nexo.common.api.artwork.constant;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ArtWorkState {

    PENDING("PENDING", "未处理"),

    SUCCESS("SUCCESS", "上链成功"),

    ARCHIVED("ARCHIVED", "已下架");

    @EnumValue
    private final String code; // 状态码

    private final String description; // 状态描述
}
