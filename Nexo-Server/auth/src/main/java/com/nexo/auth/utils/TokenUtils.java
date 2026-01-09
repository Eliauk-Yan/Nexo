package com.nexo.auth.utils;

import cn.hutool.core.lang.UUID;
import cn.hutool.crypto.SecureUtil;
import com.nexo.common.cache.constant.CacheConstant;

import java.nio.charset.StandardCharsets;

/**
 * @classname TokenUtils
 * @description Token 工具类
 * @date 2026/01/09 13:46
 */
public class TokenUtils {

    private static final String TOKEN_AES_KEY = "token-2026-666";

    public static final String TOKEN_PREFIX = "token:";

    public static String getTokenValueByKey(String key) {
        if (key == null) {
            return null;
        }
        String value = key + CacheConstant.CACHE_KEY_SEPARATOR + UUID.randomUUID();
        return SecureUtil.aes(TOKEN_AES_KEY.getBytes(StandardCharsets.UTF_8)).encryptBase64(value);
    }

    public static String getTokenKeyByValue(String value) {
        if (value == null) {
            return null;
        }
        String decryptValue = SecureUtil.aes(TOKEN_AES_KEY.getBytes(StandardCharsets.UTF_8)).decryptStr(value);
        return decryptValue.substring(0, decryptValue.lastIndexOf(CacheConstant.CACHE_KEY_SEPARATOR));
    }

}
