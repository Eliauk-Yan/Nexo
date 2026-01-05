package com.nexo.business.chain.api.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @classname ChainServiceRequest
 * @description 链平台请求接口
 * @date 2026/01/04 17:28
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChainProviderRequest {

    /**
     * 签名
     */
    private String signature;

    /**
     * 域名
     */
    private String host;

    /**
     * 当前时间
     */
    private Long currentTime;

    /**
     * 请求体
     */
    private ChainProviderRequestBody body;

    /**
     * 请求路径
     */
    private String path;

}
