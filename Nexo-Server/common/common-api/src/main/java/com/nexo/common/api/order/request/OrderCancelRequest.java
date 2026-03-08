package com.nexo.common.api.order.request;

import com.nexo.common.api.order.constant.TradeOrderEvent;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * 订单取消请求
 */
@Getter
@Setter
public class OrderCancelRequest extends OrderUpdateRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    @Override
    public TradeOrderEvent getOrderEvent() {
        return TradeOrderEvent.CANCEL;
    }

}
