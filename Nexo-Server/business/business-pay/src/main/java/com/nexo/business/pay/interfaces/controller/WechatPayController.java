package com.nexo.business.pay.interfaces.controller;

import com.nexo.business.pay.channel.PayChannelService;
import com.nexo.business.pay.channel.PayChannelServiceFactory;
import com.nexo.common.api.pay.constant.PaymentType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static com.nexo.business.pay.channel.service.MockPayChannelServiceImpl.context;

@RestController
@RequestMapping("/wxpay")
@RequiredArgsConstructor
public class WechatPayController {

    private static final int HTTP_SERVER_ERROR_CODE = HttpServletResponse.SC_INTERNAL_SERVER_ERROR;

    private final PayChannelServiceFactory payChannelServiceFactory;

    @RequestMapping(value = "/notify", method = {RequestMethod.POST, RequestMethod.GET})
    public void payNotify(HttpServletRequest request, HttpServletResponse response) {
        // 步骤1：从工厂中获取微信支付渠道实现
        PayChannelService wxPayChannelService = payChannelServiceFactory.get(PaymentType.WECHAT);

        // 步骤2：把微信原始回调请求交给渠道实现处理
        boolean result = wxPayChannelService.notify(request, response);

        // 步骤3：如果处理失败，返回 500 让微信稍后重试
        if (!result) {
            response.setStatus(HTTP_SERVER_ERROR_CODE);
        }
    }

    @RequestMapping(value = "/payNotifyMock", method = {RequestMethod.POST, RequestMethod.GET})
    public void payNotifyMock(String payOrderId, String paidAmount) {
        // 步骤1：从工厂中获取 MOCK 支付渠道实现
        PayChannelService wxPayChannelService = payChannelServiceFactory.get(PaymentType.MOCK);

        // 步骤2：构造 MOCK 回调上下文，金额从元转换为分
        Map<String, Serializable> params = new HashMap<>(4);
        params.put("payOrderId", payOrderId);
        params.put("paidAmount", new BigDecimal(paidAmount).multiply(new BigDecimal(100)).longValue());
        context.set(params);

        // 步骤3：直接调用 MOCK 渠道的 notify，模拟支付成功回调
        boolean result = wxPayChannelService.notify(null, null);

        // 步骤4：如果模拟回调失败，直接抛异常方便联调排查
        Assert.isTrue(result, "支付通知失败");
    }
}
