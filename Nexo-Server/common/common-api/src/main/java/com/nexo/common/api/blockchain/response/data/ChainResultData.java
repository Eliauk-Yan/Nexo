package com.nexo.common.api.blockchain.response.data;

import lombok.Getter;
import lombok.Setter;

/**
 * @classname ChainResultData
 * @description 链交易结果数据
 * @date 2026/02/24 02:46
 */
@Getter
@Setter
public class ChainResultData {

    /**
     * 链上用户唯一ID
     */
    private String userId;

    /**
     * 链上资产唯一ID
     */
    private String assetId;

    /**
     * 交易哈希
     */
    private String txid;



}
