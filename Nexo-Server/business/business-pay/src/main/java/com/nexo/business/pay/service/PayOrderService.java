package com.nexo.business.pay.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.business.pay.mapper.mybatis.PayOrderMapper;
import com.nexo.common.api.pay.constant.PayState;
import com.nexo.common.api.pay.request.PayCreateRequest;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * 支付单服务
 */
@Service
@Slf4j
public class PayOrderService extends ServiceImpl<PayOrderMapper, PayOrder> {

    /**
     * 创建支付单
     */
    public PayOrder create(PayCreateRequest request) {
        // 1. 幂等判断
        PayOrder existPayOrder = this.getOne(new LambdaQueryWrapper<PayOrder>()
                .eq(PayOrder::getPayerId, request.getPayerId())
                .eq(PayOrder::getBizNo, request.getBizNo())
                .eq(PayOrder::getBizType, request.getBizType())
                .eq(PayOrder::getPayChannel, request.getPayChannel().getCode()));
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
    public void paying(String payOrderId, String payUrl) {
        PayOrder payOrder = queryByOrderId(payOrderId);
        payOrder.paying(payUrl);
        saveOrUpdate(payOrder);
    }

    /**
     * 支付成功
     */
    public boolean paySuccess(String payOrderId, String channelStreamId, BigDecimal paidAmount) {
        PayOrder payOrder = queryByOrderId(payOrderId);
        payOrder.paySuccess(channelStreamId, paidAmount);
        return saveOrUpdate(payOrder);
    }

    /**
     * 支付失败
     */
    public boolean payFailed(String payOrderId) {
        PayOrder payOrder = queryByOrderId(payOrderId);
        payOrder.payFailed();
        return saveOrUpdate(payOrder);
    }

    /**
     * 支付超时
     */
    public boolean payExpired(String payOrderId) {
        PayOrder payOrder = queryByOrderId(payOrderId);
        payOrder.payExpired();
        return saveOrUpdate(payOrder);
    }

    /**
     * 根据支付单号查询
     */
    public PayOrder queryByOrderId(String payOrderId) {
        return this.getOne(new LambdaQueryWrapper<PayOrder>()
                .eq(PayOrder::getPayOrderId, payOrderId));
    }

}
