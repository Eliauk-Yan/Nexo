package com.nexo.business.pay.channel.service;

import com.nexo.business.pay.channel.data.PayChannelRequest;
import com.nexo.business.pay.channel.data.PayChannelResponse;
import com.nexo.business.pay.channel.PayChannelService;
import com.nexo.business.pay.service.PayApplicationService;
import com.nexo.common.api.pay.constant.PaymentType;
import com.nexo.common.api.pay.response.WechatPayParamsDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * 模拟支付渠道实现
 * 调用支付后立即返回成功，延迟3秒后异步模拟微信支付通知
 */
@Service("mockPayChannelService")
@RequiredArgsConstructor
@Slf4j
@Lazy
public class MockPayChannelServiceImpl implements PayChannelService {

    private final PayApplicationService payApplicationService;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    private static final Map<String, MockPayContext> CONTEXT = new ConcurrentHashMap<>();

    @Override
    public PayChannelResponse pay(PayChannelRequest payChannelRequest) {
        PayChannelResponse response = new PayChannelResponse();
        response.setSuccess(true);
        if (payChannelRequest.getPayChannel() == PaymentType.WECHAT) {
            WechatPayParamsDTO wechatPayParams = new WechatPayParamsDTO();
            wechatPayParams.setPartnerId("mock-partner-id");
            wechatPayParams.setPrepayId("mock-prepay-" + payChannelRequest.getOrderId());
            wechatPayParams.setNonceStr(UUID.randomUUID().toString().replace("-", ""));
            wechatPayParams.setTimeStamp(System.currentTimeMillis() / 1000);
            wechatPayParams.setPackageValue("Sign=WXPay");
            wechatPayParams.setSign("mock-sign");
            wechatPayParams.setExtraData(payChannelRequest.getAttach());
            response.setWechatPayParams(wechatPayParams);
        }
        // 保存上下文供异步通知使用
        CONTEXT.put(payChannelRequest.getOrderId(), new MockPayContext(payChannelRequest.getOrderId(), payChannelRequest.getAmount()));
        // 异步延迟3秒后触发模拟支付通知
        scheduler.schedule(() -> {
            try {
                boolean result = notifyByPayOrderId(payChannelRequest.getOrderId());
                if (!result) {
                    log.error("Mock支付通知失败, payOrderId={}", payChannelRequest.getOrderId());
                }
            } catch (Exception e) {
                log.error("Mock支付回调异常", e);
            }
        }, 3, TimeUnit.SECONDS);

        return response;
    }

    @Override
    public boolean notify(HttpServletRequest request, HttpServletResponse response) {
        log.warn("Mock notify 未携带上下文标识，跳过处理");
        return false;
    }

    private boolean notifyByPayOrderId(String payOrderId) {
        MockPayContext context = CONTEXT.remove(payOrderId);
        if (context == null) {
            log.warn("Mock支付上下文不存在, payOrderId={}", payOrderId);
            return false;
        }
        BigDecimal paidAmount = new BigDecimal(context.getPaidAmount())
                .divide(new BigDecimal(100), 6, RoundingMode.HALF_UP);
        String channelStreamId = UUID.randomUUID().toString();
        boolean paySuccessResult = payApplicationService.paySuccess(
                context.getPayOrderId(),
                channelStreamId,
                paidAmount
        );
        if (paySuccessResult) {
            log.info("Mock支付成功通知完成, payOrderId={}", context.getPayOrderId());
            return true;
        }
        log.error("Mock支付成功通知内部处理失败, payOrderId={}", context.getPayOrderId());
        return false;
    }

    @Getter
    private static final class MockPayContext {
        private final String payOrderId;
        private final Long paidAmount;

        private MockPayContext(String payOrderId, Long paidAmount) {
            this.payOrderId = payOrderId;
            this.paidAmount = paidAmount;
        }
    }
}

