package com.nexo.business.chain.domain.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname ChainOperateType
 * @description 链操作枚举
 * @date 2026/01/03 20:23
 */
@AllArgsConstructor
@Getter
public enum ChainOperateType {

    CREATE_ACCOUNT("CREATE_ACCOUNT", "创建链账户");

    @EnumValue
    private final String code;

    private final String desc;

}
