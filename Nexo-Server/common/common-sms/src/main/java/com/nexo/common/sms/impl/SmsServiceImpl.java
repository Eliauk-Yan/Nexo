package com.nexo.common.sms.impl;

import com.aliyun.sdk.service.dypnsapi20170525.AsyncClient;
import com.aliyun.sdk.service.dypnsapi20170525.models.SendSmsVerifyCodeRequest;
import com.aliyun.sdk.service.dypnsapi20170525.models.SendSmsVerifyCodeResponse;
import com.nexo.common.sms.SmsService;
import com.nexo.common.sms.config.SmsProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CompletableFuture;

/**
 * @classname SmsServiceImpl
 * @description 短信服务实现类
 * @date 2025/11/29 17:05
 * @created by YanShijie
 */
@Slf4j
@RequiredArgsConstructor
public class SmsServiceImpl implements SmsService {

    private final AsyncClient asyncClient;

    private final SmsProperties properties;


    @Override
    public CompletableFuture<SendSmsVerifyCodeResponse> sendSmsVerifyCode(String phone, String code) {
        // 1. 创建发送短信验证码的请求参数
        SendSmsVerifyCodeRequest sendSmsVerifyCodeRequest = SendSmsVerifyCodeRequest.builder()
                .signName(properties.getSignName())
                .templateCode(properties.getTemplateCode())
                .phoneNumber(phone)
                .templateParam("{code: " + code + ",min: 5}")
                .build();

        // 2. 发送短信验证码
        return asyncClient.sendSmsVerifyCode(sendSmsVerifyCodeRequest);
    }
}
