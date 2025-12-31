package com.nexo.common.api.blockchain.response.data;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname ChainOperationData
 * @description 链操作数据
 * @date 2025/12/31 10:35
 */
@Data
public class ChainOperationData implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 操作编号
     */
    private String operationId;

}
