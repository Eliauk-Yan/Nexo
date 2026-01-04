package com.nexo.business.chain.api;

import com.nexo.business.chain.api.request.ChainProviderRequest;
import com.nexo.business.chain.api.response.ChainProviderResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

/**
 * @classname WenChangAPI
 * @description 文昌链 API 接口
 * @date 2026/01/04 20:16
 */
@HttpExchange(accept = MediaType.APPLICATION_JSON_VALUE)
public interface WenChangAPI {

    @PostExchange(url = "/v3/account", contentType = MediaType.APPLICATION_JSON_VALUE)
    ChainProviderResponse createAccount(@RequestBody ChainProviderRequest request);

}
