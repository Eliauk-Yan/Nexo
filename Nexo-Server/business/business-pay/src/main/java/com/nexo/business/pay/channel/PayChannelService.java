package com.nexo.business.pay.channel;

import com.nexo.business.pay.channel.data.PayChannelRequest;
import com.nexo.business.pay.channel.data.PayChannelResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 支付渠道服务接口
 */
public interface PayChannelService {

    /**
     * 渠道发起支付
     */
    PayChannelResponse pay(PayChannelRequest payChannelRequest);

    /**
     * 支付结果回调
     */
    default boolean notify(HttpServletRequest request, HttpServletResponse response) {
        return false;
    }
}
