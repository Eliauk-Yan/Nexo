package com.nexo.business.pay.api.service.impl;

import com.apple.itunes.storekit.client.AppStoreServerAPIClient;
import com.apple.itunes.storekit.model.JWSTransactionDecodedPayload;
import com.apple.itunes.storekit.model.TransactionInfoResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexo.business.pay.api.config.AppleIapProperties;
import com.nexo.business.pay.api.request.IapPayRequest;
import com.nexo.business.pay.api.response.IapPayResponse;
import com.nexo.business.pay.api.service.AppStoreServerApiService;
import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.business.pay.service.PayApplicationService;
import com.nexo.business.pay.service.PayOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Objects;

/**
 * App Store Server API 客户端实现类。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppStoreServerApiServiceImpl implements AppStoreServerApiService {

    /**
     * Apple IAP 相关配置
     */
    private final AppleIapProperties properties;

    /**
     * Apple 官方 App Store Server API 客户端
     */
    private final AppStoreServerAPIClient appStoreServerAPIClient;

    /**
     * 支付应用服务，用于在苹果交易校验通过后确认订单支付成功并触发后续业务回调。
     */
    private final PayApplicationService payApplicationService;

    /**
     * 支付订单服务，用于查询交易流水是否已经绑定到其他订单，避免交易复用。
     */
    private final PayOrderService payOrderService;

    /**
     * JSON 反序列化工具，用于解析苹果 signedTransactionInfo 中的 JWS payload。
     */
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 处理应用内购买支付确认。
     */
    @Override
    public IapPayResponse pay(IapPayRequest request) {
        IapPayResponse response = new IapPayResponse();
        // 1. 校验应用内购买凭据是否为空
        if (StringUtils.isAnyBlank(request.getProductId(), request.getTransactionId())) {
            response.setSuccess(false);
            response.setResponseCode("IAP_PURCHASE_PROOF_REQUIRED");
            response.setResponseMessage("应用内购买凭据不能为空");
            return response;
        }
        try {
            // 2. 通过 App Store Server API 获取交易信息
            JWSTransactionDecodedPayload transaction = getTransaction(request.getTransactionId());
            // 3. 校验交易信息是否匹配当前订单
            validateTransaction(transaction, request.getTransactionId(), request.getProductId());
            // 4. 校验交易是否已被其他订单使用
            PayOrder usedOrder = payOrderService.queryByChannelStreamId(request.getTransactionId());
            if (usedOrder != null && !Objects.equals(usedOrder.getPayOrderId(), request.getOutTradeNo())) {
                response.setSuccess(false);
                response.setResponseCode("IAP_TRANSACTION_REUSED");
                response.setResponseMessage("应用内购买交易已被其他订单使用");
                return response;
            }
            // 5. 确认支付成功并回调业务
            PayOrder payOrder = payOrderService.queryByOrderId(request.getOutTradeNo());
            if (payOrder == null) {
                throw new IllegalStateException("支付订单不存在");
            }
            boolean result = payApplicationService.paySuccess(
                    request.getOutTradeNo(),
                    transaction.getTransactionId(),
                    payOrder.getOrderAmount()
            );

            response.setSuccess(result);
            if (!result) {
                response.setResponseCode("IAP_PAY_CONFIRM_FAILED");
                response.setResponseMessage("应用内购买支付确认失败");
            }
            return response;
        } catch (Exception e) {
            log.warn("应用内购买交易校验失败, payOrderId={}, productId={}, transactionId={}",
                    request.getOutTradeNo(), request.getProductId(), request.getTransactionId(), e);
            response.setSuccess(false);
            response.setResponseCode("IAP_PAY_CONFIRM_FAILED");
            response.setResponseMessage(e.getMessage());
            return response;
        }
    }


    /**
     * 根据苹果交易号查询 App Store Server API，并解析返回的签名交易信息。
     */
    private JWSTransactionDecodedPayload getTransaction(String transactionId) {
        try {
            // 1. 使用交易号调用 Apple 单笔交易查询接口。
            TransactionInfoResponse response = appStoreServerAPIClient.getTransactionInfo(transactionId);
            String signedTransactionInfo = response.getSignedTransactionInfo();
            if (StringUtils.isBlank(signedTransactionInfo)) {
                throw new IllegalStateException("Apple 响应缺少 signedTransactionInfo");
            }
            // 2. JWS 格式为 header.payload.signature，至少需要包含 header 和 payload。
            String[] parts = signedTransactionInfo.split("\\.");
            if (parts.length < 2) {
                throw new IllegalStateException("signedTransactionInfo 格式错误");
            }
            // 3. JWS 第二段是 payload，采用 Base64 URL 编码，解码后反序列化为交易对象。
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(payloadBytes, JWSTransactionDecodedPayload.class);
        } catch (Exception e) {
            throw new IllegalStateException("Apple 交易校验失败: " + e.getMessage(), e);
        }
    }

    /**
     * 校验苹果交易信息是否满足当前订单支付要求。
     */
    private void validateTransaction(JWSTransactionDecodedPayload transaction, String expectedTransactionId, String expectedProductId) {
        // 防止客户端传入 A 交易号，但苹果返回内容并不对应当前交易。
        if (!Objects.equals(transaction.getTransactionId(), expectedTransactionId)) {
            throw new IllegalStateException("Apple 交易号不匹配");
        }
        // 防止低价商品交易被拿来支付高价商品订单。
        if (!Objects.equals(transaction.getProductId(), expectedProductId)) {
            throw new IllegalStateException("Apple 商品 ID 不匹配");
        }
        // 如果系统配置了 Bundle ID，则必须与苹果交易中的 bundleId 完全一致。
        if (StringUtils.isNotBlank(properties.getBundleId())
                && !Objects.equals(transaction.getBundleId(), properties.getBundleId())) {
            throw new IllegalStateException("Apple Bundle ID 不匹配");
        }
        // 区分 Sandbox 和 Production，避免测试环境交易被用于正式环境订单，或反向混用。
        if (StringUtils.isNotBlank(properties.getEnvironment())
                && (transaction.getEnvironment() == null
                || !properties.getEnvironment().equalsIgnoreCase(transaction.getEnvironment().getValue()))) {
            throw new IllegalStateException("Apple 交易环境不匹配");
        }
        // revocationDate 存在说明交易已被撤销或退款，不能继续确认为有效支付。
        if (transaction.getRevocationDate() != null) {
            throw new IllegalStateException("Apple 交易已撤销");
        }
    }

}
