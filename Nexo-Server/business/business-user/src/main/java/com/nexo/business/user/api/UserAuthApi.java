package com.nexo.business.user.api;

import com.nexo.business.user.api.response.RealNameAuthResponse;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange(accept = MediaType.APPLICATION_JSON_VALUE)
public interface UserAuthApi {

    @PostExchange(url = "/api-mall/api/id_card/check", contentType = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    RealNameAuthResponse realNameAuth(@RequestBody MultiValueMap<String, String> form);

}
