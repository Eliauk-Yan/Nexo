package com.nexo.common.api.blockchain.constant;

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

    CREATE_ACCOUNT("CREATE_ACCOUNT", "创建链账户"),

    NFT_ON_CHAIN("NFT_ON_CHAIN", "NFT上链"),

    NFT_MINT("NFT_MINT", "NFT铸造"),

    NFT_TRANSFER("NFT_TRANSFER", "NFT转增");

    private final String code;

    private final String desc;

}
