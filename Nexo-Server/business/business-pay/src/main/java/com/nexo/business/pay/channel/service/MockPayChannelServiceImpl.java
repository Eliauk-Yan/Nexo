package com.nexo.business.pay.channel.service;

import com.nexo.business.pay.channel.data.PayChannelRequest;
import com.nexo.business.pay.channel.data.PayChannelResponse;
import com.nexo.business.pay.channel.PayChannelService;
import com.nexo.business.pay.service.PayApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * 模拟支付渠道实现
 * <p>
 * 调用支付后立即返回成功，延迟3秒后异步回调 paySuccess
 */
@Service("mockPayChannelService")
@Slf4j
@Lazy
@RequiredArgsConstructor
public class MockPayChannelServiceImpl implements PayChannelService {

    private final PayApplicationService payApplicationService;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    @Override
    public PayChannelResponse pay(PayChannelRequest payChannelRequest) {
        PayChannelResponse response = new PayChannelResponse();
        response.setSuccess(true);
        // 设置支付连接
        response.setPayUrl("http://mock-pay.nexo.com/pay?orderId=" + payChannelRequest.getOrderId());
        // 保存上下文供回调使用
        Map<String, Object> context = new HashMap<>();
        context.put("payOrderId", payChannelRequest.getOrderId());
        context.put("paidAmount", payChannelRequest.getAmount());
        // 异步延迟3秒后触发支付成功回调
        scheduler.schedule(() -> {
            try {
                String payOrderId = (String) context.get("payOrderId");
                Long paidAmountCent = (Long) context.get("paidAmount");
                // 分转元
                BigDecimal paidAmount = new BigDecimal(paidAmountCent).divide(new BigDecimal(100), 6, RoundingMode.HALF_UP);
                String channelStreamId = UUID.randomUUID().toString();
                payApplicationService.paySuccess(payOrderId, channelStreamId, paidAmount);
                log.info("Mock支付成功回调完成, payOrderId={}", payOrderId);
            } catch (Exception e) {
                log.error("Mock支付回调异常", e);
            }
        }, 3, TimeUnit.SECONDS);

        return response;
    }
}
