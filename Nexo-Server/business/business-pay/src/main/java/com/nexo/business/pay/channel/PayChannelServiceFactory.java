package com.nexo.business.pay.channel;

import com.nexo.common.api.pay.constant.PaymentType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 支付渠道服务工厂
 * <p>
 * 根据支付渠道类型获取对应的 PayChannelService 实现
 * 在开发环境下，统一使用 MockPayChannelService
 */
@Service
@RequiredArgsConstructor
public class PayChannelServiceFactory {

    @Autowired
    private final Map<String, PayChannelService> serviceMap = new ConcurrentHashMap<>();

    @Value("${spring.profiles.active:dev}")
    private String profile;

    public PayChannelService get(PaymentType payChannel) {
        // 开发环境使用Mock
        if ("dev".equals(profile)) {
            return serviceMap.get("mockPayChannelService");
        }

        // 根据渠道类型拼接beanName：如 WECHAT -> wechatPayChannelService
        String beanName = payChannel.name().toLowerCase() + "PayChannelService";
        PayChannelService payChannelService = serviceMap.get(beanName);

        if (payChannelService != null) {
            return payChannelService;
        } else {
            throw new UnsupportedOperationException(
                    "No PayChannelService Found With payChannel : " + payChannel + " , beanName : " + beanName);
        }
    }
}
