package com.nexo.auth;

import cn.hutool.core.util.RandomUtil;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * @classname TestRandomUtil
 * @description TODO
 * @date 2025/12/14 14:08
 * @created by YanShijie
 */
@SpringBootTest
public class TestRandomUtil {

    @Test
    void test() {
        int num = 30;
        while (num-- > 0) {
            String s = RandomUtil.randomNumbers(6);
            System.out.println(s);
        }
    }
}
