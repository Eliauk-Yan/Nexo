package com.nexo.common.api.order.response;

import com.nexo.common.base.response.BaseResponse;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * @classname OrderResponse
 * @description 订单模块响应
 * @date 2026/02/06 22:39
 */
@Getter
@Setter
public class OrderResponse<T> extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
