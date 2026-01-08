package com.nexo.auth.service;

public interface TokenService {

    /**
     *
     * @param scene 获取 token 的场景
     * @param id 藏品 id
     * @return token
     */
    String getToken(String scene, String id);
}
