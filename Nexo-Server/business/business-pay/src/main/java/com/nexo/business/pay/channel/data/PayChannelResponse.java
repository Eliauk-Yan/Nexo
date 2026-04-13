package com.nexo.business.pay.channel.data;

import com.nexo.common.api.pay.response.WechatPayParamsDTO;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * 支付渠道响应
 */
@Getter
@Setter
public class PayChannelResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 是否成功
     */
    private Boolean success;

    /**
     * 响应编码
     */
    private String responseCode;

    /**
     * 响应消息
     */
    private String responseMessage;

    /**
     * 微信App支付参数
     */
    private WechatPayParamsDTO wechatPayParams;
}
