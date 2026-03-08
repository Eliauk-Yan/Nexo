package com.nexo.business.pay.channel;

/**
 * 支付渠道服务接口
 */
public interface PayChannelService {

    /**
     * 发起支付
     *
     * @param payChannelRequest 支付渠道请求
     * @return 支付渠道响应
     */
    PayChannelResponse pay(PayChannelRequest payChannelRequest);
}
