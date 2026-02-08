package com.nexo.common.api.order.response;

import com.nexo.common.api.common.response.BaseResponse;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname OrderResponse
 * @description 订单模块响应
 * @date 2026/02/06 22:39
 */
@Getter
@Setter
public class OrderResponse extends BaseResponse {

    private String orderId;

    private String streamId;

}
