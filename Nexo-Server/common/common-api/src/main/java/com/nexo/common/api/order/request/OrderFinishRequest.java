package com.nexo.common.api.order.request;

import com.nexo.common.api.order.constant.TradeOrderEvent;

/**
 * 订单完成请求
 */
public class OrderFinishRequest extends OrderUpdateRequest {

    @Override
    public TradeOrderEvent getOrderEvent() {
        return TradeOrderEvent.FINISH;
    }
}
