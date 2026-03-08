package com.nexo.business.pay.channel.mock;

import com.nexo.business.pay.channel.PayChannelRequest;
import com.nexo.business.pay.channel.PayChannelResponse;
import com.nexo.business.pay.channel.PayChannelService;
import com.nexo.business.pay.service.PayApplicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
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
public class MockPayChannelServiceImpl implements PayChannelService {

    @Autowired
    @Lazy
    private PayApplicationService payApplicationService;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    @Override
    public PayChannelResponse pay(PayChannelRequest payChannelRequest) {
        PayChannelResponse response = new PayChannelResponse();
        response.setSuccess(true);
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
                java.math.BigDecimal paidAmount = new java.math.BigDecimal(paidAmountCent)
                        .divide(new java.math.BigDecimal(100), 6, java.math.RoundingMode.HALF_UP);

                String channelStreamId = java.util.UUID.randomUUID().toString();

                payApplicationService.paySuccess(payOrderId, channelStreamId, paidAmount);
                log.info("Mock支付成功回调完成, payOrderId={}", payOrderId);
            } catch (Exception e) {
                log.error("Mock支付回调异常", e);
            }
        }, 3, TimeUnit.SECONDS);

        return response;
    }
}
