package com.nexo.auth.service;

public interface TokenService {

    /**
     *
     * @param id 藏品 id
     * @return token
     */
    String getToken(Long id);
}
