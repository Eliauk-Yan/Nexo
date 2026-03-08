package com.nexo.business.pay.service;

import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.request.OrderPayRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.pay.constant.PaymentType;
import com.nexo.common.api.user.constant.UserType;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付应用服务
 * <p>
 * 负责支付成功后的业务编排：
 * 1. 更新支付单状态
 * 2. 推进订单状态
 */
@Service
@Slf4j
public class PayApplicationService {

    @Autowired
    private PayOrderService payOrderService;

    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    /**
     * 支付成功处理
     *
     * @param payOrderId      支付单号
     * @param channelStreamId 渠道流水号
     * @param paidAmount      支付金额
     */
    public boolean paySuccess(String payOrderId, String channelStreamId, BigDecimal paidAmount) {
        // 1. 查询支付单
        PayOrder payOrder = payOrderService.queryByOrderId(payOrderId);
        if (payOrder == null) {
            log.error("支付单不存在, payOrderId={}", payOrderId);
            return false;
        }

        // 2. 幂等检查
        if (payOrder.isPaid()) {
            log.info("支付单已支付, payOrderId={}", payOrderId);
            return true;
        }

        // 3. 更新支付单状态为已支付
        boolean payOrderResult = payOrderService.paySuccess(payOrderId, channelStreamId, paidAmount);
        if (!payOrderResult) {
            log.error("支付单状态更新失败, payOrderId={}", payOrderId);
            return false;
        }

        // 4. 推进订单状态到已支付
        try {
            OrderPayRequest orderPayRequest = new OrderPayRequest();
            orderPayRequest.setOrderId(payOrder.getBizNo());
            orderPayRequest.setPaymentAmount(paidAmount);
            orderPayRequest.setPaymentStreamId(payOrder.getPayOrderId());
            orderPayRequest.setPaymentMethod(PaymentType.valueOf(payOrder.getPayChannel()));
            orderPayRequest.setOperateTime(LocalDateTime.now());
            orderPayRequest.setOperator(payOrder.getPayerId());
            orderPayRequest.setOperatorType(UserType.CUSTOMER);
            orderPayRequest.setIdentifier(payOrder.getPayOrderId());

            OrderResponse<?> orderResponse = orderFacade.paySuccess(orderPayRequest);
            if (!orderResponse.getSuccess()) {
                log.error("订单支付推进失败, orderId={}, msg={}", payOrder.getBizNo(), orderResponse.getMessage());
                return false;
            }
        } catch (Exception e) {
            log.error("推进订单支付状态异常, payOrderId={}", payOrderId, e);
            return false;
        }

        log.info("支付成功处理完成, payOrderId={}, bizNo={}", payOrderId, payOrder.getBizNo());
        return true;
    }
}
