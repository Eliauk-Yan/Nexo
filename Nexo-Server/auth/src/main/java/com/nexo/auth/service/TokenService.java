package com.nexo.auth.service;

import com.nexo.auth.interfaces.dto.TokenDTO;

public interface TokenService {

    /**
     *  获取防止重复提交的token
     * @param scene 场景
     * @return token
     */
    String getToken(TokenDTO scene);
}
