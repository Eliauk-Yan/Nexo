package com.nexo.business.pay.interfaces.facade;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.nexo.business.pay.channel.data.PayChannelRequest;
import com.nexo.business.pay.channel.data.PayChannelResponse;
import com.nexo.business.pay.channel.PayChannelServiceFactory;
import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.business.pay.exception.PayErrorCode;
import com.nexo.business.pay.mapper.convert.PayOrderConvert;
import com.nexo.business.pay.service.PayOrderService;
import com.nexo.common.api.pay.request.PayQueryRequest;
import com.nexo.common.api.pay.response.data.PayOrderVO;
import com.nexo.common.base.response.MultiResponse;
import com.nexo.common.base.response.ResponseCode;
import com.nexo.common.api.pay.PayFacade;
import com.nexo.common.api.pay.constant.PayState;
import com.nexo.common.api.pay.request.PayCreateRequest;
import com.nexo.common.api.pay.response.PayOrderDTO;
import com.nexo.common.api.pay.response.PayResponse;
import com.nexo.common.lock.DistributeLock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboService;

import java.util.List;

/**
 * 支付Dubbo接口实现
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
@Slf4j
public class PayFacadeImpl implements PayFacade {

    private final PayOrderService payOrderService;

    private final PayOrderConvert payOrderConvert;

    private final PayChannelServiceFactory payChannelServiceFactory;

    @DistributeLock(keyExpression = "#request.bizNo", scene = "GENERATE_PAY_URL")
    @Override
    public PayResponse<PayOrderDTO> createPayOrder(PayCreateRequest request) {
        PayResponse<PayOrderDTO> response = new PayResponse<>();
        try {
            // 1. 创建支付单
            PayOrder payOrder = payOrderService.create(request); // 这里是幂等的 可能会拿到同一条支付单
            // 2. 如果支付单已在支付中，直接返回
            if (payOrder.getOrderState() == PayState.PAYING) {
                response.setData(payOrderConvert.toDTO(payOrder));
                response.setSuccess(true);
                response.setCode(ResponseCode.SUCCESS.getCode());
                response.setMessage(ResponseCode.SUCCESS.getMessage());
                return response;
            }
            // 3. 如果支付单已支付，返回错误
            if (payOrder.isPaid()) {
                response.setSuccess(false);
                response.setCode(PayErrorCode.ORDER_ALREADY_PAID.getCode());
                response.setMessage(PayErrorCode.ORDER_ALREADY_PAID.getMessage());
                return response;
            }
            // 4. 调用支付渠道发起支付
            // 构造支付请求
            PayChannelRequest channelRequest = new PayChannelRequest();
            channelRequest.setOrderId(payOrder.getPayOrderId()); // 订单号
            channelRequest.setAmount(yuanToCent(request.getOrderAmount())); //  金额
            channelRequest.setDescription(request.getMemo()); // 备注
            channelRequest.setAttach(request.getBizNo()); // 附加信息
            channelRequest.setPayChannel(request.getPayChannel());
            PayChannelResponse channelResponse = payChannelServiceFactory.get(request.getPayChannel()).pay(channelRequest);
            // 5. 处理渠道响应
            if (channelResponse.getSuccess()) {
                // 更新支付单状态为支付中
                payOrderService.paying(payOrder.getPayOrderId());
                payOrder.setOrderState(PayState.PAYING);
                PayOrderDTO payOrderDTO = payOrderConvert.toDTO(payOrder);
                payOrderDTO.setWechatPayParams(channelResponse.getWechatPayParams());
                response.setData(payOrderDTO);
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
    public MultiResponse<PayOrderVO> queryPayOrders(PayQueryRequest request) {
        // 1. 根据条件查询支付订单
        List<PayOrder> payOrders = payOrderService.list(
                new LambdaQueryWrapper<PayOrder>()
                        .eq(PayOrder::getBizNo, request.getBizNo())
                        .eq(PayOrder::getBizType, request.getBizType())
                        .eq(PayOrder::getPayerId, request.getPayerId())
                        .eq(PayOrder::getOrderState, request.getPayState())
        );
        var payQueryResponse = new MultiResponse<PayOrderVO>();
        payQueryResponse.setSuccess(true);
        // 2. 转换为VO
        payQueryResponse.setData(payOrderConvert.toVOs(payOrders));
        return payQueryResponse;
    }

    /**
     * 元转分
     */
    private Long yuanToCent(java.math.BigDecimal yuan) {
        return yuan.multiply(new java.math.BigDecimal(100)).longValue();
    }
}

