package com.nexo.business.order.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.interfaces.vo.OrderVO;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.*;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.web.result.MultiResult;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Order模块服务接口
 */
public interface OrderService extends IService<TradeOrder> {

    /**
     * 获取订单列表
     */
    MultiResult<OrderVO> getOrderList(TradeOrderState state, Long current, Long size);

    /**
     * 获取指定用户订单
     */
    TradeOrder getOrder(String orderId, Long userId);

    /**
     * 创建订单并确认
     */
    OrderResponse<Boolean> createAndConfirm(OrderCreateAndConfirmRequest request);

    /**
     * 取消订单
     */
    OrderResponse<Boolean> cancel(OrderCancelRequest cancelRequest);

    /**
     * 超时关单
     */
    OrderResponse<Boolean> timeout(OrderTimeoutRequest timeoutRequest);

    /**
     * 批量查询超时订单
     */
    List<TradeOrder> pageQueryTimeoutOrders(int pageSize, String buyerIdTailNumber, Long minId);
    /**
     * 支付成功
     */
    boolean paySuccess(OrderPayRequest request);

    /**
     * 完成订单
     */
    boolean finish(OrderFinishRequest request);

}
