package com.nexo.business.pay.interfaces.facade;

import com.nexo.business.pay.channel.PayChannelRequest;
import com.nexo.business.pay.channel.PayChannelResponse;
import com.nexo.business.pay.channel.PayChannelServiceFactory;
import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.business.pay.service.PayOrderService;
import com.nexo.common.base.response.ResponseCode;
import com.nexo.common.api.pay.PayFacade;
import com.nexo.common.api.pay.constant.PayState;
import com.nexo.common.api.pay.request.PayCreateRequest;
import com.nexo.common.api.pay.response.PayOrderDTO;
import com.nexo.common.api.pay.response.PayResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * 支付Dubbo接口实现
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
@Slf4j
public class PayFacadeImpl implements PayFacade {

    private final PayOrderService payOrderService;

    private final PayChannelServiceFactory payChannelServiceFactory;

    @Override
    public PayResponse<PayOrderDTO> createPayOrder(PayCreateRequest request) {
        PayResponse<PayOrderDTO> response = new PayResponse<>();
        try {
            // 1. 创建支付单（含幂等）
            PayOrder payOrder = payOrderService.create(request);
            // 2. 如果支付单已在支付中，直接返回
            if (payOrder.getOrderState() == PayState.PAYING) {
                response.setData(toDTO(payOrder));
                response.setSuccess(true);
                response.setCode(ResponseCode.SUCCESS.getCode());
                response.setMessage(ResponseCode.SUCCESS.getMessage());
                return response;
            }
            // 3. 如果支付单已支付，返回错误
            if (payOrder.isPaid()) {
                response.setSuccess(false);
                response.setCode("ORDER_ALREADY_PAID");
                response.setMessage("订单已支付");
                return response;
            }
            // 4. 调用支付渠道发起支付
            PayChannelRequest channelRequest = new PayChannelRequest();
            channelRequest.setOrderId(payOrder.getPayOrderId());
            channelRequest.setAmount(yuanToCent(request.getOrderAmount()));
            channelRequest.setDescription(request.getMemo());
            channelRequest.setAttach(request.getBizNo());
            PayChannelResponse channelResponse = payChannelServiceFactory
                    .get(request.getPayChannel())
                    .pay(channelRequest);
            // 5. 处理渠道响应
            if (channelResponse.getSuccess()) {
                // 更新支付单状态为支付中
                payOrderService.paying(payOrder.getPayOrderId(), channelResponse.getPayUrl());
                payOrder.setPayUrl(channelResponse.getPayUrl());
                payOrder.setOrderState(PayState.PAYING);

                response.setData(toDTO(payOrder));
                response.setSuccess(true);
                response.setCode(ResponseCode.SUCCESS.getCode());
                response.setMessage(ResponseCode.SUCCESS.getMessage());
            } else {
                response.setSuccess(false);
                response.setCode(channelResponse.getResponseCode());
                response.setMessage(channelResponse.getResponseMessage());
            }
        } catch (Exception e) {
            log.error("创建支付单异常, bizNo={}", request.getBizNo(), e);
            response.setSuccess(false);
            response.setCode("PAY_CREATE_ERROR");
            response.setMessage("创建支付单失败: " + e.getMessage());
        }

        return response;
    }

    @Override
    public PayResponse<PayOrderDTO> queryPayOrder(String payOrderId) {
        PayResponse<PayOrderDTO> response = new PayResponse<>();
        try {
            PayOrder payOrder = payOrderService.queryByOrderId(payOrderId);
            if (payOrder == null) {
                response.setSuccess(false);
                response.setCode("PAY_ORDER_NOT_FOUND");
                response.setMessage("支付单不存在");
                return response;
            }
            response.setData(toDTO(payOrder));
            response.setSuccess(true);
            response.setCode(ResponseCode.SUCCESS.getCode());
            response.setMessage(ResponseCode.SUCCESS.getMessage());
        } catch (Exception e) {
            log.error("查询支付单异常, payOrderId={}", payOrderId, e);
            response.setSuccess(false);
            response.setCode("PAY_QUERY_ERROR");
            response.setMessage("查询支付单失败");
        }
        return response;
    }

    /**
     * 转换为DTO
     */
    private PayOrderDTO toDTO(PayOrder payOrder) {
        PayOrderDTO dto = new PayOrderDTO();
        dto.setPayOrderId(payOrder.getPayOrderId());
        dto.setPayUrl(payOrder.getPayUrl());
        dto.setOrderState(payOrder.getOrderState());
        dto.setPaidAmount(payOrder.getPaidAmount());
        dto.setPaySucceedTime(payOrder.getPaySucceedTime());
        dto.setBizNo(payOrder.getBizNo());
        dto.setPayChannel(payOrder.getPayChannel());
        return dto;
    }

    /**
     * 元转分
     */
    private Long yuanToCent(java.math.BigDecimal yuan) {
        return yuan.multiply(new java.math.BigDecimal(100)).longValue();
    }
}
