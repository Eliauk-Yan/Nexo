package com.nexo.common.file.utils;

import com.nexo.common.file.constant.enums.ServicePath;
import com.nexo.common.file.constant.enums.TypePath;

/**
 * @classname FileUtils
 * @description 文件工具类
 * @date 2025/12/12 10:55
 * @created by YanShijie
 */
public class FileUtils {

    /**
     * 拼接文件路径
     * @param servicePath 模块路径
     * @param typePath 类型路径
     * @return 文件路径
     */
    public static String concatFilePath(ServicePath servicePath, TypePath typePath, String fileName) {
        return servicePath.getUrl() + "/" + typePath.getUrl() + "/" + fileName;
    }
}




