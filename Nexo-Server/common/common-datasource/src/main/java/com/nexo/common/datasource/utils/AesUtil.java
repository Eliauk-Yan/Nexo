package com.nexo.common.datasource.utils;

import cn.hutool.crypto.SecureUtil;
import cn.hutool.crypto.symmetric.AES;
import cn.hutool.crypto.symmetric.SymmetricAlgorithm;
import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * AES 加解密工具（Hutool）
 */
@Component
public class AesUtil {

    @Value("${crypto.aes.key}")
    private String key;

    private AES aes;

    @PostConstruct
    public void init() {
        // 固定 key → 固定密文（方便等值匹配）
        byte[] keyBytes = SecureUtil.generateKey(
                SymmetricAlgorithm.AES.getValue(),
                key.getBytes(StandardCharsets.UTF_8)
        ).getEncoded();

        this.aes = SecureUtil.aes(keyBytes);
    }

    /**
     * 加密（Base64）
     */
    public String encrypt(String plainText) {
        if (StringUtils.isBlank(plainText)) {
            return plainText;
        }
        return aes.encryptBase64(plainText);
    }

    /**
     * 解密（Base64）
     */
    public String decrypt(String cipherText) {
        if (StringUtils.isBlank(cipherText)) {
            return cipherText;
        }
        return aes.decryptStr(cipherText, StandardCharsets.UTF_8);
    }
}
