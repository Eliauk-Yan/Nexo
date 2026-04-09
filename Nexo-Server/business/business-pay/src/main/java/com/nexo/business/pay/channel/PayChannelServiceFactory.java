package com.nexo.business.pay.channel;

import com.nexo.common.api.pay.constant.PaymentType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 支付渠道服务工厂
 */
@Service
@RequiredArgsConstructor
public class PayChannelServiceFactory {

    private final Map<String, PayChannelService> serviceMap;

    @Value("${spring.profiles.active:dev}")
    private String profile;

    public PayChannelService get(PaymentType payChannel) {
        if ("dev".equals(profile)) {
            return serviceMap.get("mockPayChannelService");
        }
        // 自定义命名规则
        String beanName = payChannel.name().toLowerCase() + "PayChannelService";
        PayChannelService payChannelService = serviceMap.get(beanName);
        if (payChannelService != null) {
            return payChannelService;
        }
        throw new UnsupportedOperationException("No PayChannelService Found With payChannel : " + payChannel + " , beanName : " + beanName);
    }
}