package com.nexo.common.api.nft.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * NFT事件枚举
 */
@Getter
@AllArgsConstructor
public enum NFTEvent {

    CHAIN("CHAIN", "上链"),

    REMOVE("REMOVE", "下架"),

    MODIFY_INVENTORY("MODIFY_INVENTORY", "修改藏品库存"),

    MODIFY_PRICE("MODIFY_PRICE", "修改藏品价格"),

    SALE("SALE", "出售"),

    TRY_SALE("TRY_SALE", "尝试出售"),

    CONFIRM_SALE("CONFIRM_SALE", "确认出售"),

    CANCEL_SALE("CANCEL_SALE", "取消出售"),

    FREEZE_INVENTORY("FREEZE_INVENTORY", "冻结库存"),

    UNFREEZE_INVENTORY("UNFREEZE_INVENTORY", "解冻库存"),

    UNFREEZE_AND_SALE("UNFREEZE_AND_SALE", "解冻库存并出售");

    private final String code;

    private final String message;
}
