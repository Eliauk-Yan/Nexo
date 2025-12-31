package com.nexo.common.api.blockchain.response.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname BlockchainCreateData
 * @description 创建区块链数据
 * @date 2025/12/25 11:30
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChainCreateData implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 操作编号
     */
    private String operationId;

    /**
     * 链账户地址
     */
    private String account;

    /**
     * 链账户名称
     */
    private String name;

    /**
     * 平台名称
     */
    private String platform;


}
