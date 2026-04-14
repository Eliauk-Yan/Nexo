package com.nexo.business.pay.channel.service;

import com.alibaba.fastjson2.JSONObject;
import com.ijpay.core.IJPayHttpResponse;
import com.ijpay.core.enums.AuthTypeEnum;
import com.ijpay.core.enums.RequestMethodEnum;
import com.ijpay.core.kit.PayKit;
import com.ijpay.core.kit.WxPayKit;
import com.ijpay.wxpay.WxPayApi;
import com.ijpay.wxpay.enums.WxDomainEnum;
import com.ijpay.wxpay.enums.v3.BasePayApiEnum;
import com.nexo.business.pay.channel.PayChannelService;
import com.nexo.business.pay.channel.config.WxPayProperties;
import com.nexo.business.pay.channel.data.PayChannelRequest;
import com.nexo.business.pay.channel.data.PayChannelResponse;
import com.nexo.business.pay.service.PayApplicationService;
import com.nexo.common.api.pay.response.WechatPayParamsDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service("wechatPayChannelService")
@RequiredArgsConstructor
@Slf4j
public class WechatPayChannelServiceImpl implements PayChannelService {

    private final WxPayProperties properties;

    private final PayApplicationService payApplicationService;

    @Override
    public PayChannelResponse pay(PayChannelRequest request) {
        PayChannelResponse response = new PayChannelResponse();
        try {
            // 步骤1：按照微信支付 v3 APP 下单格式组装请求参数
            Map<String, Object> params = new HashMap<>(8);
            params.put("appid", properties.getAppId());
            params.put("mchid", properties.getMchId());
            params.put("description", request.getDescription());
            params.put("out_trade_no", request.getOutTradeNo());
            params.put("notify_url", properties.getNotifyUrl());
            params.put("attach", request.getAttach());

            // 步骤2：补充金额信息，微信支付金额单位必须是分
            Map<String, Object> amount = new HashMap<>(2);
            amount.put("total", request.getTotalFee());
            amount.put("currency", "CNY");
            params.put("amount", amount);

            // 步骤3：准备请求体和证书路径
            String body = JSONObject.toJSONString(params);
            String keyPath = PayKit.getFilePath(properties.getKeyPath());
            String platformCertPath = PayKit.getFilePath(properties.getPlatformCertPath());

            // 步骤4：调用 IJPay 发起微信支付 v3 APP 下单
            IJPayHttpResponse wxResponse = WxPayApi.v3(
                    RequestMethodEnum.POST,
                    WxDomainEnum.CHINA.toString(),
                    BasePayApiEnum.APP_PAY.toString(),
                    properties.getMchId(),
                    properties.getSerialNo(),
                    null,
                    keyPath,
                    body,
                    AuthTypeEnum.RSA.getCode()
            );

            log.info("微信APP下单响应 status={}, body={}", wxResponse.getStatus(), wxResponse.getBody());

            // 步骤5：校验微信响应状态和签名，避免把异常响应继续往下传
            boolean verifySignature = WxPayKit.verifyPublicKeySignature(wxResponse, platformCertPath);
            if (wxResponse.getStatus() != HttpStatus.OK.value() || !verifySignature) {
                response.setSuccess(false);
                response.setResponseCode("WECHAT_PAY_REQUEST_ERROR");
                response.setResponseMessage(verifySignature ? wxResponse.getBody() : "微信响应验签失败");
                return response;
            }

            // 步骤6：从微信返回结果中提取 prepay_id
            JSONObject json = JSONObject.parseObject(wxResponse.getBody());
            String prepayId = json.getString("prepay_id");
            if (prepayId == null || prepayId.isBlank()) {
                response.setSuccess(false);
                response.setResponseCode("WECHAT_PREPAY_ID_MISSING");
                response.setResponseMessage("微信下单成功但未返回 prepay_id");
                return response;
            }

            // 步骤7：基于 prepay_id 生成 App 拉起微信支付所需的签名参数
            Map<String, String> signMap = WxPayKit.appCreateSign(
                    properties.getAppId(),
                    properties.getMchId(),
                    prepayId,
                    keyPath
            );

            // 步骤8：把签名参数转换成系统统一的返回对象
            WechatPayParamsDTO wechatPayParams = new WechatPayParamsDTO();
            wechatPayParams.setPartnerId(signMap.get("partnerid"));
            wechatPayParams.setPrepayId(signMap.get("prepayid"));
            wechatPayParams.setNonceStr(signMap.get("noncestr"));
            wechatPayParams.setPackageValue(signMap.get("package"));
            wechatPayParams.setSign(signMap.get("sign"));
            wechatPayParams.setTimeStamp(Long.valueOf(signMap.get("timestamp")));

            // 步骤9：把调起支付参数返回给上层业务
            response.setSuccess(true);
            response.setResponseCode("SUCCESS");
            response.setResponseMessage("OK");
            response.setWechatPayParams(wechatPayParams);
            return response;
        } catch (Exception e) {
            log.error("微信APP支付下单失败", e);
            response.setSuccess(false);
            response.setResponseCode("WECHAT_PAY_CREATE_ERROR");
            response.setResponseMessage(e.getMessage());
            return response;
        }
    }

    @Override
    public boolean notify(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 步骤1：读取微信回调请求头中的签名相关信息
            String timestamp = request.getHeader("Wechatpay-Timestamp");
            String nonce = request.getHeader("Wechatpay-Nonce");
            String signature = request.getHeader("Wechatpay-Signature");

            // 步骤2：读取微信回调原始请求体
            String body = readRequestBody(request);

            // 步骤3：用 APIv3 密钥和平台证书验签并解密回调报文
            String plainText = WxPayKit.verifyPublicKeyNotify(
                    body,
                    signature,
                    nonce,
                    timestamp,
                    properties.getApiKey3(),
                    PayKit.getFilePath(properties.getPlatformCertPath())
            );
            log.info("微信支付回调解密成功 plainText={}", plainText);

            // 步骤4：解析回调明文，只处理支付成功事件
            JSONObject notifyJson = JSONObject.parseObject(plainText);
            String eventType = notifyJson.getString("event_type");
            if (!"TRANSACTION.SUCCESS".equals(eventType)) {
                log.info("忽略非支付成功回调 eventType={}", eventType);
                writeNotifyResponse(response, HttpServletResponse.SC_OK, "SUCCESS", "成功");
                return true;
            }

            // 步骤5：从回调里提取实际支付金额并从分转换成元
            JSONObject amountJson = notifyJson.getJSONObject("amount");
            BigDecimal paidAmount = BigDecimal.valueOf(amountJson.getLongValue("total"))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // 步骤6：调用支付应用服务，把支付单和订单状态推进为已支付
            boolean handled = payApplicationService.paySuccess(
                    notifyJson.getString("out_trade_no"),
                    notifyJson.getString("transaction_id"),
                    paidAmount
            );

            // 步骤7：向微信返回处理结果，成功必须返回 SUCCESS
            if (!handled) {
                writeNotifyResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "FAIL", "处理失败");
                return false;
            }

            writeNotifyResponse(response, HttpServletResponse.SC_OK, "SUCCESS", "成功");
            return true;
        } catch (Exception e) {
            log.error("微信支付回调处理失败", e);
            try {
                writeNotifyResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "FAIL", "处理失败");
            } catch (Exception ex) {
                log.error("微信支付回调响应写回失败", ex);
            }
            return false;
        }
    }

    private void writeNotifyResponse(HttpServletResponse response, int status, String code, String message) throws Exception {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        Map<String, String> result = new HashMap<>(4);
        result.put("code", code);
        result.put("message", message);
        response.getOutputStream().write(JSONObject.toJSONString(result).getBytes(StandardCharsets.UTF_8));
        response.flushBuffer();
    }

    private String readRequestBody(HttpServletRequest request) throws Exception {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
        }
        return builder.toString();
    }
}
