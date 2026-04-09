package com.nexo.business.pay.channel;

import com.nexo.business.pay.channel.data.PayChannelRequest;
import com.nexo.business.pay.channel.data.PayChannelResponse;

/**
 * 支付渠道服务接口
 */
public interface PayChannelService {

    /**
     * 渠道发起支付
     */
    PayChannelResponse pay(PayChannelRequest payChannelRequest);
}
