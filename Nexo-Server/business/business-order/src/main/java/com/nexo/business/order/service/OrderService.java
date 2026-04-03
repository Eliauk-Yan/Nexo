package com.nexo.business.order.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.interfaces.vo.OrderVO;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.OrderFinishRequest;
import com.nexo.common.api.order.request.OrderPayRequest;
import com.nexo.common.web.result.MultiResult;

/**
 * Order模块服务接口
 */
public interface OrderService extends IService<TradeOrder> {

    MultiResult<OrderVO> getOrderList(TradeOrderState state, Long current, Long size);

    TradeOrder getOrder(String orderId, Long userId);

    boolean paySuccess(OrderPayRequest request);

    boolean finish(OrderFinishRequest request);

    boolean cancelOrder(String orderId, Long userId);
}
