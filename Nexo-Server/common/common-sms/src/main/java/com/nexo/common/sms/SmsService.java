package com.nexo.common.sms;

import com.aliyun.sdk.service.dypnsapi20170525.models.SendSmsVerifyCodeResponse;

import java.util.concurrent.CompletableFuture;

public interface SmsService {

    /**
     * 调用第三方服务发送短信验证码
     * @param phone 手机号
     * @param code 验证码
     */
    CompletableFuture<SendSmsVerifyCodeResponse> sendSmsVerifyCode(String phone, String code);

}
