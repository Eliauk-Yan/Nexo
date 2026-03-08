package com.nexo.common.api.pay.response;

import com.nexo.common.api.common.response.BaseResponse;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * 支付模块响应
 */
@Getter
@Setter
public class PayResponse<T> extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;
}
