package com.nexo.business.pay.api.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * 应用内购买支付响应
 */
@Getter
@Setter
public class IapPayResponse implements Serializable {

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

}
