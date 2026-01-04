package com.nexo.business.chain.utils;

import cn.hutool.crypto.digest.DigestUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * @classname WenChangChainUtil
 * @description 文昌链工具类
 * @date 2026/01/03 19:30
 */
public class WenChangChainUtil {

    /**
     * <a href="https://docs.avata.bianjie.ai/doc-2728163#java-%E8%AF%AD%E8%A8%80%E7%89%88%E6%9C%AC">官网地址</a>
     * 对请求参数进行签名处理
     *
     * @param path      请求路径,仅截取域名后及 Query 参数前部分,例："/v2/accounts";
     * @param query     Query 参数,例："key1=value1&key2=value2",需转为 Map 格式
     * @param body      Body 参数,例："{\"count\": 1, \"operation_id\": \"random_string\"}",需转为 Map 格式
     * @param timestamp 当前时间戳（毫秒）,例：1647751123703
     * @param apiSecret 应用方的 API Secret,例："AKIDz8krbsJ5yKBZQpn74WFkmLPc5ab"
     * @return 返回签名结果
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
