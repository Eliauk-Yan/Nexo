package com.nexo.business.order.interfaces.controller;

import com.nexo.business.order.interfaces.vo.OrderVO;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @classname OrderController
 * @description 订单模块控制器
 * @date 2026/02/06 22:21
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;

    /**
     * 获取订单列表
     * @param state 订单状态
     * @param current 当前页码
     * @param size 页大小
     * @return 订单列表
     */
    @GetMapping("/list")
    public MultiResult<OrderVO> getOrderList(TradeOrderState state, Long current, Long size) {
        return orderService.getOrderList(state, current, size);
    }


}
