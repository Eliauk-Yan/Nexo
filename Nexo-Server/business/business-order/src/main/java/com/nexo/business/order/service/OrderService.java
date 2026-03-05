package com.nexo.business.order.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.interfaces.vo.OrderVO;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.web.result.MultiResult;

/**
 * Order模块服务接口
 */
public interface OrderService extends IService<TradeOrder> {

    /**
     * 获取订单列表
     * @param state 订单状态
     * @param current 当前页
     * @param size 页大小
     * @return 订单列表
     */
    MultiResult<OrderVO> getOrderList(TradeOrderState state, Long current, Long size);
}
