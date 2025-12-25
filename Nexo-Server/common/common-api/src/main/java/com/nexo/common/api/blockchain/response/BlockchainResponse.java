package com.nexo.common.api.blockchain.response;

import com.nexo.common.base.response.BaseResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname BlockchainResponse
 * @description 区块链响应
 * @date 2025/12/25 11:26
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class BlockchainResponse<T> extends BaseResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
