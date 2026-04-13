package com.nexo.common.api.pay.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class WechatPayParamsDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String partnerId;

    private String prepayId;

    private String nonceStr;

    private Long timeStamp;

    private String packageValue;

    private String sign;

    private String extraData;
}
