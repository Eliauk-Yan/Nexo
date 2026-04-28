package com.nexo.business.pay.service;

import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.request.AssetCreateRequest;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.request.OrderPayRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.api.order.response.data.OrderDTO;
import com.nexo.common.api.pay.constant.PaymentType;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.user.constant.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付应用服务
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PayApplicationService {

    private final PayOrderService payOrderService;

    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;

    /**
     * 支付成功处理
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

        // 3. 先查询订单详情，为后续订单推进和藏品分发做准备
        OrderResponse<OrderDTO> getOrderResponse = orderFacade.getOrder(payOrder.getBizNo(), null);
        if (getOrderResponse == null || !Boolean.TRUE.equals(getOrderResponse.getSuccess()) || getOrderResponse.getData() == null) {
            log.error("查询订单失败, payOrderId={}, orderId={}", payOrderId, payOrder.getBizNo());
            return false;
        }
        OrderDTO order = getOrderResponse.getData();
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
            if (orderResponse == null || !Boolean.TRUE.equals(orderResponse.getSuccess())) {
                log.error("订单支付推进失败, orderId={}, code={}, msg={}", payOrder.getBizNo(),
                        orderResponse == null ? null : orderResponse.getCode(),
                        orderResponse == null ? null : orderResponse.getMessage());
                return false;
            }
        } catch (Exception e) {
            log.error("推进订单支付状态异常, payOrderId={}", payOrderId, e);
            return false;
        }

        // 5. 支付成功后为藏品订单分发资产并触发异步铸造
        if (order.getNftType() == NFTType.NFT && order.getOrderState() != TradeOrderState.CLOSED) {
            AssetCreateRequest allocateRequest = new AssetCreateRequest();
            allocateRequest.setBusinessNo(order.getOrderId());
            allocateRequest.setBusinessType(payOrder.getBizType());
            allocateRequest.setBuyerId(Long.valueOf(order.getBuyerId()));
            allocateRequest.setArtworkId(Long.valueOf(order.getProductId()));
            allocateRequest.setNftType(order.getNftType());
            allocateRequest.setPurchasePrice(order.getPaymentAmount());
            allocateRequest.setIdentifier(payOrder.getPayOrderId());
            Boolean allocateResult = nftFacade.allocateAsset(allocateRequest);
            if (!Boolean.TRUE.equals(allocateResult)) {
                log.error("支付成功后分发资产失败, payOrderId={}, orderId={}", payOrderId, order.getOrderId());
                return false;
            }
        }

        // 6. 当前置业务都处理成功后，再把支付单正式更新为已支付
        boolean payOrderResult = payOrderService.paySuccess(payOrderId, channelStreamId, paidAmount);
        if (!payOrderResult) {
            log.error("支付单状态更新失败, payOrderId={}", payOrderId);
            return false;
        }

        log.info("支付成功处理完成, payOrderId={}, bizNo={}", payOrderId, payOrder.getBizNo());
        return true;
    }
}
