package com.nexo.common.api.order.request;

import com.nexo.common.api.order.constant.TradeOrderEvent;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * 订单超时请求
 */
@Getter
@Setter
public class OrderTimeoutRequest extends OrderUpdateRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    @Override
    public TradeOrderEvent getOrderEvent() {
        return TradeOrderEvent.TIME_OUT;
    }

}
