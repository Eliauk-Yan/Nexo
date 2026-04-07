package com.nexo.business.pay.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.business.pay.mapper.mybatis.PayOrderMapper;
import com.nexo.common.api.pay.constant.PayState;
import com.nexo.common.api.pay.request.PayCreateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * 支付单服务
 */
@Service
@Slf4j
public class PayOrderService extends ServiceImpl<PayOrderMapper, PayOrder> {

    /**
     * 创建支付单（含幂等）
     */
    public PayOrder create(PayCreateRequest request) {
        // 幂等检查：查询是否已有相同业务单号的未过期支付单
        PayOrder existPayOrder = this.getOne(new LambdaQueryWrapper<PayOrder>()
                .eq(PayOrder::getPayerId, request.getPayerId())
                .eq(PayOrder::getBizNo, request.getBizNo())
                .eq(PayOrder::getBizType, request.getBizType())
                .eq(PayOrder::getPayChannel, request.getPayChannel().getCode()));

        if (existPayOrder != null) {
            if (existPayOrder.getOrderState() != PayState.EXPIRED) {
                return existPayOrder;
            }
        }
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
