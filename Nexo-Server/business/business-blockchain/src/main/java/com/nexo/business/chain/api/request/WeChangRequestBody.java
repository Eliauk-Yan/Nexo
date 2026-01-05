package com.nexo.business.chain.api.request;

import com.alibaba.fastjson2.annotation.JSONField;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @classname WeChangRequest
 * @description 文昌链请求体
 * @date 2026/01/05 10:06
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeChangRequestBody implements ChainProviderRequestBody {

    /**
     * 操作 ID
     */
    @JSONField(name = "operation_id")
    private String operationId;

}
