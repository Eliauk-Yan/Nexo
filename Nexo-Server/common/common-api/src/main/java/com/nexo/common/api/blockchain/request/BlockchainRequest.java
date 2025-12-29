package com.nexo.common.api.blockchain.request;

import com.nexo.common.api.base.request.BaseRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname BlockchainRequest
 * @description 区块链请求
 * @date 2025/12/25 16:49
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class BlockchainRequest extends BaseRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;



}
