package com.nexo.business.pay.interfaces.facade;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.business.pay.domain.exception.PayErrorCode;
import com.nexo.business.pay.api.request.IapPayRequest;
import com.nexo.business.pay.api.response.IapPayResponse;
import com.nexo.business.pay.api.service.AppStoreServerApiService;
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

import java.math.BigDecimal;
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

    private final AppStoreServerApiService appStoreServerApiService;

    @DistributeLock(keyExpression = "#request.bizNo", scene = "GENERATE_PAY_URL")
    @Override
    public PayResponse<PayOrderDTO> createPayOrder(PayCreateRequest request) {
        PayResponse<PayOrderDTO> response = new PayResponse<>();
        try {
            // 步骤1：先在本地创建支付单，幂等场景下可能直接拿到已有支付单
            PayOrder payOrder = payOrderService.create(request); // 这里是幂等的 可能会拿到同一条支付单
            // 步骤2：如果支付单已经处于支付中，直接把现有结果返回给前端
            if (payOrder.getOrderState() == PayState.PAYING) {
                response.setData(payOrderConvert.toDTO(payOrder));
                response.setSuccess(true);
                response.setCode(ResponseCode.SUCCESS.getCode());
                response.setMessage(ResponseCode.SUCCESS.getMessage());
                return response;
            }
            // 步骤3：如果支付单已经支付成功，则不允许再次发起支付
            if (payOrder.isPaid()) {
                response.setSuccess(false);
                response.setCode(PayErrorCode.ORDER_ALREADY_PAID.getCode());
                response.setMessage(PayErrorCode.ORDER_ALREADY_PAID.getMessage());
                return response;
            }
            // 步骤4：把业务支付单转换成渠道侧需要的下单参数
            IapPayRequest iapPayRequest = new IapPayRequest();
            iapPayRequest.setOutTradeNo(payOrder.getPayOrderId()); // 订单号
            iapPayRequest.setTotalFee(request.getOrderAmount().multiply(new BigDecimal(100)).longValue()); //  金额 元转分
            iapPayRequest.setDescription(request.getMemo()); // 备注
            iapPayRequest.setAttach(request.getBizNo()); // 附加信息
            iapPayRequest.setProductId(request.getIapProductId());
            iapPayRequest.setTransactionId(request.getIapTransactionId());
            iapPayRequest.setPurchaseToken(request.getIapPurchaseToken());

            // 步骤5：调用 IAP 支付服务确认 Apple 内购交易
            IapPayResponse iapPayResponse = appStoreServerApiService.pay(iapPayRequest);

            // 步骤6：处理 IAP 响应，成功则把支付单更新为支付中
            if (iapPayResponse.getSuccess()) {
                PayOrder latestPayOrder = payOrderService.queryByOrderId(payOrder.getPayOrderId());
                if (latestPayOrder != null && !latestPayOrder.isPaid()) {
                    payOrderService.paying(payOrder.getPayOrderId());
                    latestPayOrder = payOrderService.queryByOrderId(payOrder.getPayOrderId());
                }
                PayOrderDTO payOrderDTO = payOrderConvert.toDTO(latestPayOrder == null ? payOrder : latestPayOrder);
                response.setData(payOrderDTO);
                response.setSuccess(true);
                response.setCode(ResponseCode.SUCCESS.getCode());
                response.setMessage(ResponseCode.SUCCESS.getMessage());
            } else {
                response.setSuccess(false);
                response.setCode(iapPayResponse.getResponseCode());
                response.setMessage(iapPayResponse.getResponseMessage());
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
}

