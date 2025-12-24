package com.nexo.business.blockchain.constant.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname OperationType
 * @description 链操作业务类型
 * @date 2025/12/24 20:00
 */
@AllArgsConstructor
@Getter
public enum ChainOperationBizType {

    USER("USER", "用户"),

    ARTWORK("ARTWORK", "藏品"),

    ASSET("ASSET", "资产"),

    BLOCKCHAIN("BLOCKCHAIN", "区块链");

    private final String code;

    private final String desc;
}
