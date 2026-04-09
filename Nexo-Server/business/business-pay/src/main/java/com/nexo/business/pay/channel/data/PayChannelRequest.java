package com.nexo.business.pay.channel.data;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * 支付渠道请求
 */
@Getter
@Setter
public class PayChannelRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 支付单号
     */
    private String orderId;

    /**
     * 金额（单位：分）
     */
    private Long amount;

    /**
     * 订单描述
     */
    private String description;

    /**
     * 附加信息
     */
    private String attach;
}
