package com.nexo.business.chain.utils;

import cn.hutool.crypto.digest.DigestUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONWriter;
import com.google.common.collect.Maps;

import java.util.HashMap;
import java.util.Map;

/**
 * @classname WenChangChainUtil
 * @description 文昌链工具类
 * @date 2026/01/03 19:30
 */
public class WenChangChainUtil {

    /**
     * 配置请求头
     * @param signature 请求签名
     * @param timestamp 请求当前时间
     * @param apiKey apiKey
     * @return 请求头
     */
    public static Map<String,String> configureHeaders(String signature, Long timestamp, String apiKey) {
        Map<String, String> headers = Maps.newHashMapWithExpectedSize(3);
        headers.put("X-Api-Key", apiKey);
        headers.put("X-Timestamp", timestamp.toString());
        headers.put("X-Signature", signature);
        return headers;
    }

    /**
     * 签名请求
     * <a href="https://docs.avata.bianjie.ai/doc-2728163#java-%E8%AF%AD%E8%A8%80%E7%89%88%E6%9C%AC">官网地址</a>
     */
    public static String signRequest(String path, Map<String, Object> query, Map<String, Object> body, long timestamp, String apiSecret) {
        Map<String, Object> paramsMap = new HashMap<>();
        paramsMap.put("path_url", path);
        if (query != null && !query.isEmpty()) {
            query.forEach((key, value) -> paramsMap.put("query_" + key, String.valueOf(value)));
        }
        if (body != null && !body.isEmpty()) {
            body.forEach((key, value) -> paramsMap.put("body_" + key, value));
        }
        //  将请求参数序列化为排序后的 JSON 字符串
        String jsonStr = JSON.toJSONString(paramsMap, JSONWriter.Feature.MapSortField);
        // 执行签名
        return DigestUtil.sha256Hex(jsonStr + timestamp + apiSecret);
    }
}
