package com.nexo.business.pay.channel.entity;

import com.alibaba.fastjson2.annotation.JSONField;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WechatPayNotifyEntity {

    @JSONField(name = "transaction_id")
    private String transactionId;

    @JSONField(name = "amount")
    private WechatPayNotifyAmount amount;

    @JSONField(name = "mchid")
    private String mchId;

    @JSONField(name = "trade_state")
    private String tradeState;

    @JSONField(name = "bank_type")
    private String bankType;

    @JSONField(name = "success_time")
    private String successTime;

    @JSONField(name = "payer")
    private WechatPayNotifyPayer payer;

    @JSONField(name = "out_trade_no")
    private String outTradeNo;

    @JSONField(name = "appid")
    private String appId;

    @JSONField(name = "trade_state_desc")
    private String tradeStateDesc;

    @JSONField(name = "trade_type")
    private String tradeType;

    @JSONField(name = "attach")
    private String attach;
}
