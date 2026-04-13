package com.nexo.business.pay.channel.service;

import com.alibaba.fastjson2.JSON;
import com.nexo.business.pay.channel.PayChannelService;
import com.nexo.business.pay.channel.constant.WechatTradeState;
import com.nexo.business.pay.channel.data.PayChannelRequest;
import com.nexo.business.pay.channel.data.PayChannelResponse;
import com.nexo.business.pay.channel.entity.WechatPayNotifyEntity;
import com.nexo.business.pay.config.WechatPayProperties;
import com.nexo.business.pay.service.PayApplicationService;
import com.ijpay.core.kit.WxPayKit;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Service("wechatPayChannelService")
@RequiredArgsConstructor
@Slf4j
public class WechatPayChannelServiceImpl implements PayChannelService {

    private final WechatPayProperties wechatPayProperties;

    private final PayApplicationService payApplicationService;

    @Override
    public PayChannelResponse pay(PayChannelRequest payChannelRequest) {
        if (!wechatPayProperties.isPayConfigReady()) {
            throw new IllegalStateException("微信支付商户参数尚未配置，暂时无法发起真实微信支付。");
        }
        throw new UnsupportedOperationException("微信原生支付下单逻辑尚未接入，待商户参数申请完成后补充。");
    }

    @Override
    public boolean notify(HttpServletRequest request, HttpServletResponse response) {
        Map<String, String> result = new LinkedHashMap<>();
        try {
            if (!wechatPayProperties.isCallbackConfigReady()) {
                log.error("微信支付回调配置不完整");
                writeResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, result, "ERROR", "微信支付回调配置未完成");
                return false;
            }

            String timestamp = request.getHeader("Wechatpay-Timestamp");
            String nonce = request.getHeader("Wechatpay-Nonce");
            String serialNo = request.getHeader("Wechatpay-Serial");
            String signature = request.getHeader("Wechatpay-Signature");

            String encryptedBody = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
            log.info("收到微信支付回调, serialNo={}, body={}", serialNo, encryptedBody);

            String plainText = WxPayKit.verifyNotify(
                    serialNo,
                    encryptedBody,
                    signature,
                    nonce,
                    timestamp,
                    wechatPayProperties.getApiKey3(),
                    wechatPayProperties.getPlatformCertPath()
            );

            if (plainText == null || plainText.isBlank()) {
                log.error("微信支付回调验签失败");
                writeResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, result, "ERROR", "签名错误");
                return false;
            }

            log.info("微信支付回调明文={}", plainText);
            WechatPayNotifyEntity notifyEntity = JSON.parseObject(plainText, WechatPayNotifyEntity.class);
            if (notifyEntity == null) {
                writeResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, result, "ERROR", "回调报文为空");
                return false;
            }

            if (WechatTradeState.SUCCESS.equals(notifyEntity.getTradeState())) {
                BigDecimal paidAmount = BigDecimal.valueOf(notifyEntity.getAmount().getTotal()).movePointLeft(2);
                boolean paySuccess = payApplicationService.paySuccess(
                        notifyEntity.getOutTradeNo(),
                        notifyEntity.getTransactionId(),
                        paidAmount
                );
                if (paySuccess) {
                    writeResponse(response, HttpServletResponse.SC_OK, result, "SUCCESS", "SUCCESS");
                    return true;
                }
                writeResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, result, "ERROR", "内部处理失败");
                return false;
            }

            if (WechatTradeState.PAYERROR.equals(notifyEntity.getTradeState())) {
                boolean payFailed = payApplicationService.payFailed(notifyEntity.getOutTradeNo());
                if (payFailed) {
                    writeResponse(response, HttpServletResponse.SC_OK, result, "SUCCESS", "SUCCESS");
                    return true;
                }
                writeResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, result, "ERROR", "内部处理失败");
                return false;
            }

            log.info("忽略非终态微信支付回调, tradeState={}, outTradeNo={}", notifyEntity.getTradeState(), notifyEntity.getOutTradeNo());
            writeResponse(response, HttpServletResponse.SC_OK, result, "SUCCESS", "SUCCESS");
            return true;
        } catch (Exception e) {
            log.error("微信支付回调处理异常", e);
            try {
                writeResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, result, "ERROR", "回调处理失败");
            } catch (Exception ignored) {
                log.warn("回写微信支付回调响应失败", ignored);
            }
            return false;
        }
    }

    private void writeResponse(HttpServletResponse response, int status, Map<String, String> result, String code, String message) throws Exception {
        response.setStatus(status);
        result.put("code", code);
        result.put("message", message);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json;charset=UTF-8");
        response.getOutputStream().write(JSON.toJSONString(result).getBytes(StandardCharsets.UTF_8));
        response.flushBuffer();
    }
}
