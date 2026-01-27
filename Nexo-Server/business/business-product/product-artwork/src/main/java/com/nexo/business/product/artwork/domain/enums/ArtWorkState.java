package com.nexo.business.product.artwork.domain.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ArtWorkState {

    PENDING("pending", "未处理"),

    SUCCESS("success", "上链成功"),

    ARCHIVED("archived", "已下架");

    @EnumValue // 标记数据库存的值是 code
    private final String code; // 状态码

    private final String description; // 状态描述
}
