package com.nexo.business.pay.service;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.business.pay.domain.exception.PayException;
import com.nexo.business.pay.mapper.mybatis.PayOrderMapper;
import com.nexo.common.api.pay.constant.PayState;
import com.nexo.common.api.pay.request.PayCreateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

import static com.nexo.business.pay.domain.exception.PayErrorCode.PAY_ORDER_UPDATE_FAILED;


/**
 * 支付单服务
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class PayOrderService extends ServiceImpl<PayOrderMapper, PayOrder> {

    private final PayOrderMapper payOrderMapper;

    /**
     * 创建支付单
     */
    public PayOrder create(PayCreateRequest request) {
        // 1. 幂等判断
        PayOrder existPayOrder = this.getOne(new LambdaQueryWrapper<PayOrder>()
                .eq(PayOrder::getPayerId, request.getPayerId())
                .eq(PayOrder::getBizNo, request.getBizNo())
                .eq(PayOrder::getBizType, request.getBizType()));
        // 2. 如果以创建直接返回
        if (existPayOrder != null) {
            if (existPayOrder.getOrderState() != PayState.EXPIRED) {
                return existPayOrder;
            }
        }
        // 3. 创建支付单
        PayOrder payOrder = PayOrder.create(request);
        boolean saveResult = save(payOrder);
        if (!saveResult) {
            throw new RuntimeException("支付单创建失败");
        }
        return payOrder;
    }

    /**
     * 推进到支付中
     */
    public void paying(String payOrderId) {
        PayOrder payOrder = queryByOrderId(payOrderId);
        if (payOrder == null) {
            throw new PayException(PAY_ORDER_UPDATE_FAILED);
        }
        if (payOrder.getOrderState() == PayState.PAYING || payOrder.isPaid()) {
            return;
        }
        payOrder.paying();
        LambdaUpdateWrapper<PayOrder> wrapper = new LambdaUpdateWrapper<PayOrder>()
                .eq(PayOrder::getPayOrderId, payOrderId)
                .eq(PayOrder::getOrderState, PayState.TO_PAY);
        boolean updateResult = payOrderMapper.update(payOrder, wrapper) == 1;
        if (!updateResult) {
            PayOrder latestPayOrder = queryByOrderId(payOrderId);
            if (latestPayOrder != null
                    && (latestPayOrder.getOrderState() == PayState.PAYING || latestPayOrder.isPaid())) {
                return;
            }
            throw new PayException(PAY_ORDER_UPDATE_FAILED);
        }
    }

    /**
     * 支付成功
     */
    public boolean paySuccess(String payOrderId, String channelStreamId, BigDecimal paidAmount) {
        PayOrder payOrder = queryByOrderId(payOrderId);
        if (payOrder == null) {
            throw new PayException(PAY_ORDER_UPDATE_FAILED);
        }
        if (payOrder.isPaid()) {
            return true;
        }
        payOrder.paySuccess(channelStreamId, paidAmount);
        LambdaUpdateWrapper<PayOrder> wrapper = new LambdaUpdateWrapper<PayOrder>()
                .eq(PayOrder::getPayOrderId, payOrderId)
                .in(PayOrder::getOrderState, PayState.TO_PAY, PayState.PAYING);
        boolean updateResult = payOrderMapper.update(payOrder, wrapper) == 1;
        if (!updateResult) {
            PayOrder latestPayOrder = queryByOrderId(payOrderId);
            if (latestPayOrder != null && latestPayOrder.isPaid()) {
                return true;
            }
            throw new PayException(PAY_ORDER_UPDATE_FAILED);
        }
        return true;
    }

    /**
     * 根据支付单号查询
     */
    public PayOrder queryByOrderId(String payOrderId) {
        return this.getOne(new LambdaQueryWrapper<PayOrder>()
                .eq(PayOrder::getPayOrderId, payOrderId));
    }

    /**
     * 根据渠道流水号查询支付单。
     */
    public PayOrder queryByChannelStreamId(String channelStreamId) {
        return this.getOne(new LambdaQueryWrapper<PayOrder>()
                .eq(PayOrder::getChannelStreamId, channelStreamId));
    }

}
