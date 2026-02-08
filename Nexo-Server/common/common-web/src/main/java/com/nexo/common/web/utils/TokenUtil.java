package com.nexo.common.web.utils;

import cn.hutool.crypto.SecureUtil;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static com.nexo.common.cache.constant.CacheConstant.CACHE_KEY_SEPARATOR;


public class TokenUtil {

    private static final String TOEKN_AES_KEY = "2026一路顺风";

    public static final String TOKEN_PREFIX = "token:";

    public static String getTokenValueByKey(String tokenKey) {
        if (tokenKey == null) {
            return null;
        }
        String uuid = UUID.randomUUID().toString();
        String tokenValue = tokenKey + CACHE_KEY_SEPARATOR + uuid;
        return SecureUtil.aes(TOEKN_AES_KEY.getBytes(StandardCharsets.UTF_8)).encryptBase64(tokenValue);
    }

    public static String getTokenKeyByValue(String tokenValue) {
        if (tokenValue == null) {
            return null;
        }
        String decryptTokenValue = SecureUtil.aes(TOEKN_AES_KEY.getBytes(StandardCharsets.UTF_8)).decryptStr(tokenValue);
        System.out.println(decryptTokenValue);
        return decryptTokenValue.substring(0, decryptTokenValue.lastIndexOf(CACHE_KEY_SEPARATOR));
    }
}
