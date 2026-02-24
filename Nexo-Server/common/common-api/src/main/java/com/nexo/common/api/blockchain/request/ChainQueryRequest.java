package com.nexo.common.api.blockchain.request;

import com.nexo.common.api.common.request.BaseRequest;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname ChainQueryRequest
 * @description 链查询请求
 * @date 2026/02/24 02:46
 */
@Getter
@Setter
public class ChainQueryRequest extends BaseRequest {

    /**
     * 操作id
     */
    private String operationId;

    /**
     * 操作信息的主键 ID
     */
    private Long operationInfoId;

}
