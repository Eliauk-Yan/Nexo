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
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * 模拟支付渠道实现
 * 调用支付后立即返回成功，延迟3秒后异步模拟支付通知
 */
@Service("mockPayChannelService")
@RequiredArgsConstructor
@Slf4j
@Lazy
public class MockPayChannelServiceImpl implements PayChannelService {

    private final PayApplicationService payApplicationService;

    public static final ThreadLocal<Map<String, Serializable>> context = new ThreadLocal<>();

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    @Override
    public PayChannelResponse pay(PayChannelRequest payChannelRequest) {
        PayChannelResponse response = new PayChannelResponse();
        response.setSuccess(true);
        if (payChannelRequest.getPayChannel() == PaymentType.WECHAT) {
            WechatPayParamsDTO wechatPayParams = new WechatPayParamsDTO();
            wechatPayParams.setPartnerId("mock-partner-id");
            wechatPayParams.setPrepayId("mock-prepay-" + payChannelRequest.getOutTradeNo());
            wechatPayParams.setNonceStr(UUID.randomUUID().toString().replace("-", ""));
            wechatPayParams.setTimeStamp(System.currentTimeMillis() / 1000);
            wechatPayParams.setPackageValue("Sign=WXPay");
            wechatPayParams.setSign("mock-sign");
            wechatPayParams.setExtraData(payChannelRequest.getAttach());
            response.setWechatPayParams(wechatPayParams);
        }

        Map<String, Serializable> params = new HashMap<>(4);
        params.put("payOrderId", payChannelRequest.getOutTradeNo());
        params.put("paidAmount", payChannelRequest.getTotalFee());
        context.set(params);

        scheduler.schedule(() -> {
            try {
                context.set(params);
                boolean result = notify(null, null);
                if (!result) {
                    log.error("Mock支付通知失败, payOrderId={}", payChannelRequest.getOutTradeNo());
                }
            } catch (Exception e) {
                log.error("Mock支付回调异常", e);
            }
        }, 3, TimeUnit.SECONDS);

        return response;
    }

    @Override
    public boolean notify(HttpServletRequest request, HttpServletResponse response) {
        try {
            Map<String, Serializable> params = context.get();
            if (params != null) {
                String payOrderId = (String) params.get("payOrderId");
                Object paidAmountValue = params.get("paidAmount");
                if (payOrderId == null || paidAmountValue == null) {
                    log.warn("Mock notify 上下文缺少必要参数");
                    return false;
                }
                Long paidAmount = paidAmountValue instanceof Long
                        ? (Long) paidAmountValue
                        : Long.valueOf(String.valueOf(paidAmountValue));
                BigDecimal paidAmountYuan = new BigDecimal(paidAmount)
                        .divide(new BigDecimal(100), 6, RoundingMode.HALF_UP);
                String channelStreamId = UUID.randomUUID().toString();
                boolean paySuccessResult = payApplicationService.paySuccess(payOrderId, channelStreamId, paidAmountYuan);
                if (paySuccessResult) {
                    log.info("Mock支付成功通知完成, payOrderId={}", payOrderId);
                    return true;
                }
                log.error("Mock支付成功通知内部处理失败, payOrderId={}", payOrderId);
                return false;
            }
            log.warn("Mock notify 未携带上下文标识，跳过处理");
            return false;
        } finally {
            context.remove();
        }
    }
}
