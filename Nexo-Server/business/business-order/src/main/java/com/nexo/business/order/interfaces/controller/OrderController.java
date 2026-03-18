package com.nexo.business.order.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.interfaces.vo.OrderVO;
import com.nexo.business.order.mapper.convert.OrderConvertor;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.web.result.MultiResult;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
    private final OrderConvertor orderConvertor;

    /**
     * 获取订单列表
     */
    @GetMapping("/list")
    public MultiResult<OrderVO> getOrderList(TradeOrderState state, Long current, Long size) {
        return orderService.getOrderList(state, current, size);
    }

    /**
     * 获取单个订单详情
     */
    @GetMapping("/get")
    public Result<OrderVO> getOrder(@RequestParam String orderId) {
        Long userId = StpUtil.getLoginIdAsLong();
        TradeOrder order = orderService.getOrder(orderId, userId);
        if (order == null) {
            return Result.error("ORDER_NOT_FOUND", "订单不存在");
        }
        return Result.success(orderConvertor.toVO(order));
    }

    /**
     * 取消订单
     */
    @PostMapping("/cancel")
    public Result<Boolean> cancelOrder(@RequestParam String orderId) {
        Long userId = StpUtil.getLoginIdAsLong();
        boolean result = orderService.cancelOrder(orderId, userId);
        if (result) {
            return Result.success(true);
        }
        return Result.error("ORDER_CANCEL_FAILED", "订单取消失败");
    }

}
