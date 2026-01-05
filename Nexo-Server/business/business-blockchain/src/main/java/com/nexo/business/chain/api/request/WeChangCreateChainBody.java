package com.nexo.business.chain.api.request;

import com.alibaba.fastjson2.annotation.JSONField;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * @classname WeChangCreateChainBody
 * @description 文昌链创建链账户请求体
 * @date 2026/01/05 10:08
 */
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class WeChangCreateChainBody extends WeChangRequestBody {

    /**
     * 链账户名称
     */
    @JSONField(name = "name")
    private String name;

    public WeChangCreateChainBody(String operationId, String name) {
        super(operationId);
        this.name = name;
    }
}
