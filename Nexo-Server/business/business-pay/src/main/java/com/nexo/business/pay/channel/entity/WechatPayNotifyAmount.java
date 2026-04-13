package com.nexo.business.pay.channel.entity;

import com.alibaba.fastjson2.annotation.JSONField;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WechatPayNotifyAmount {

    @JSONField(name = "payer_total")
    private Integer payerTotal;

    @JSONField(name = "total")
    private Integer total;

    @JSONField(name = "currency")
    private String currency;

    @JSONField(name = "payer_currency")
    private String payerCurrency;
}
