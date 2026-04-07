package com.nexo.auth.interfaces.dto;

import lombok.Data;

/**
 * 苹果登录
 */
@Data
public class AppleLoginDTO {

    private String identityToken;

    private String authorizationCode;

    private String user; // iOS首次授权时可能返回的用户信息
}