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
     * ntf唯一编号
     */
    private String nftId;

    /**
     * 交易哈希
     */
    private String txHash;

    /**
     * 状态
     */
    private String state;

    /**
     * 藏品编号
     */
    private String serialNo;


}
