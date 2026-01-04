package com.nexo.business.chain.api.response;


import com.alibaba.fastjson2.JSONObject;
import lombok.Data;

/**
 * @classname ChainProviderResponse
 * @description 链平台响应
 * @date 2026/01/04 17:32
 */
@Data
public class ChainProviderResponse {

    private JSONObject data;

    private JSONObject error;

}
