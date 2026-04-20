package com.nexo.business.notice;

import com.nexo.common.sms.SmsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * @classname SmsTest
 * @description 测试短信服务
 * @date 2025/11/29 18:53
 * @created by YanShijie
 */
@SpringBootTest
public class SmsTest {

    @Autowired
    SmsService smsService;

    @Test
    public void testSms() {
        smsService.sendSmsVerifyCode("15114785913", "888888").whenCompleteAsync((success, failure) -> {
            if (failure != null) {
                System.out.println(failure.getMessage());
            } else  {
                System.out.println(success);
            }
        });

    }

}

