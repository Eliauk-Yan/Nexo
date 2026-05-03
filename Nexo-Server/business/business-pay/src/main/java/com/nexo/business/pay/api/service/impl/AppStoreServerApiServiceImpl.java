package com.nexo.business.pay.api.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexo.business.pay.api.config.AppleIapProperties;
import com.nexo.business.pay.api.request.IapPayRequest;
import com.nexo.business.pay.api.response.AppleIapTransactionResponse;
import com.nexo.business.pay.api.response.IapPayResponse;
import com.nexo.business.pay.api.service.AppStoreServerApiService;
import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.business.pay.service.PayApplicationService;
import com.nexo.business.pay.service.PayOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigInteger;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Objects;

/**
 * App Store Server API 客户端。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppStoreServerApiServiceImpl implements AppStoreServerApiService {

    private static final String JWT_AUDIENCE = "appstoreconnect-v1";

    private final AppleIapProperties properties;

    private final ResourceLoader resourceLoader;

    private final PayApplicationService payApplicationService;

    private final PayOrderService payOrderService;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
            AppleIapTransactionResponse transaction = getTransaction(request.getTransactionId());
            // 3. 校验交易信息是否匹配当前订单
            validateTransaction(transaction, request.getTransactionId(), request.getProductId());
            // 4. 校验交易是否已被其他订单使用
            PayOrder usedOrder = payOrderService.queryByChannelStreamId(request.getTransactionId());
            if (usedOrder != null && !StringUtils.equals(usedOrder.getPayOrderId(), request.getOutTradeNo())) {
                response.setSuccess(false);
                response.setResponseCode("IAP_TRANSACTION_REUSED");
                response.setResponseMessage("应用内购买交易已被其他订单使用");
                return response;
            }
            // 5. 确认支付成功并回调业务
            BigDecimal paidAmount = new BigDecimal(request.getTotalFee())
                    .divide(new BigDecimal(100), 6, RoundingMode.HALF_UP);
            boolean result = payApplicationService.paySuccess(
                    request.getOutTradeNo(),
                    transaction.getTransactionId(),
                    paidAmount
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

    private AppleIapTransactionResponse getTransaction(String transactionId) {
        try {
            String token = createApiToken();
            String encodedTransactionId = UriUtils.encodePathSegment(transactionId, StandardCharsets.UTF_8);
            URI uri = URI.create(resolveBaseUrl() + "/inApps/v1/transactions/" + encodedTransactionId);
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(properties.getConnectTimeoutSeconds()))
                    .build();
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(properties.getRequestTimeoutSeconds()))
                    .header("Authorization", "Bearer " + token)
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Apple 交易查询失败: HTTP " + response.statusCode() + " " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            String signedTransactionInfo = root.path("signedTransactionInfo").asText(null);
            if (StringUtils.isBlank(signedTransactionInfo)) {
                throw new IllegalStateException("Apple 响应缺少 signedTransactionInfo");
            }

            return decodeSignedTransaction(signedTransactionInfo);
        } catch (Exception e) {
            throw new IllegalStateException("Apple 交易校验失败: " + e.getMessage(), e);
        }
    }

    private void validateTransaction(AppleIapTransactionResponse transaction, String expectedTransactionId, String expectedProductId) {
        if (!Objects.equals(transaction.getTransactionId(), expectedTransactionId)) {
            throw new IllegalStateException("Apple 交易号不匹配");
        }
        if (!Objects.equals(transaction.getProductId(), expectedProductId)) {
            throw new IllegalStateException("Apple 商品 ID 不匹配");
        }
        if (StringUtils.isNotBlank(properties.getBundleId())
                && !Objects.equals(transaction.getBundleId(), properties.getBundleId())) {
            throw new IllegalStateException("Apple Bundle ID 不匹配");
        }
        if (StringUtils.isNotBlank(properties.getEnvironment())
                && !Objects.equals(transaction.getEnvironment(), properties.getEnvironment())) {
            throw new IllegalStateException("Apple 交易环境不匹配");
        }
        if (transaction.getRevocationDate() != null) {
            throw new IllegalStateException("Apple 交易已撤销");
        }
    }

    private AppleIapTransactionResponse decodeSignedTransaction(String signedTransactionInfo) throws Exception {
        String[] parts = signedTransactionInfo.split("\\.");
        if (parts.length < 2) {
            throw new IllegalStateException("signedTransactionInfo 格式错误");
        }

        byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
        return objectMapper.readValue(payloadBytes, AppleIapTransactionResponse.class);
    }

    private String createApiToken() throws Exception {
        Instant now = Instant.now();
        String header = objectMapper.writeValueAsString(objectMapper.createObjectNode()
                .put("alg", "ES256")
                .put("kid", properties.getKeyId())
                .put("typ", "JWT"));
        String payload = objectMapper.writeValueAsString(objectMapper.createObjectNode()
                .put("iss", properties.getIssuerId())
                .put("iat", now.getEpochSecond())
                .put("exp", now.plusSeconds(1200).getEpochSecond())
                .put("aud", JWT_AUDIENCE)
                .put("bid", properties.getBundleId()));
        String signingInput = base64Url(header.getBytes(StandardCharsets.UTF_8))
                + "."
                + base64Url(payload.getBytes(StandardCharsets.UTF_8));
        Signature signature = Signature.getInstance("SHA256withECDSA");
        signature.initSign(loadPrivateKey());
        signature.update(signingInput.getBytes(StandardCharsets.UTF_8));
        return signingInput + "." + base64Url(derToJoseSignature(signature.sign(), 64));
    }

    private PrivateKey loadPrivateKey() throws Exception {
        String key = resolvePrivateKey()
                .replace("\\n", "\n")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(key);
        return KeyFactory.getInstance("EC").generatePrivate(new PKCS8EncodedKeySpec(keyBytes));
    }

    private String resolvePrivateKey() throws Exception {
        if (StringUtils.isNotBlank(properties.getPrivateKey())) {
            return properties.getPrivateKey();
        }

        Resource resource = resourceLoader.getResource(properties.getPrivateKeyLocation());
        if (!resource.exists()) {
            throw new IllegalStateException("Apple IAP 私钥文件不存在: " + properties.getPrivateKeyLocation());
        }
        try (InputStream inputStream = resource.getInputStream()) {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private String resolveBaseUrl() {
        if ("Production".equalsIgnoreCase(properties.getEnvironment())) {
            return properties.getProductionBaseUrl();
        }
        return properties.getSandboxBaseUrl();
    }

    private String base64Url(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private byte[] derToJoseSignature(byte[] derSignature, int outputLength) throws Exception {
        DerReader reader = new DerReader(derSignature);
        reader.expect(0x30);
        reader.readLength();
        byte[] r = toFixedLength(reader.readInteger(), outputLength / 2);
        byte[] s = toFixedLength(reader.readInteger(), outputLength / 2);
        byte[] jose = new byte[outputLength];
        System.arraycopy(r, 0, jose, 0, r.length);
        System.arraycopy(s, 0, jose, outputLength / 2, s.length);
        return jose;
    }

    private byte[] toFixedLength(BigInteger integer, int length) {
        byte[] value = integer.toByteArray();
        byte[] result = new byte[length];
        int copyLength = Math.min(value.length, length);
        System.arraycopy(value, value.length - copyLength, result, length - copyLength, copyLength);
        return result;
    }

    private static class DerReader {

        private final ByteArrayInputStream input;

        DerReader(byte[] data) {
            this.input = new ByteArrayInputStream(data);
        }

        void expect(int expected) {
            int actual = input.read();
            if (actual != expected) {
                throw new IllegalStateException("DER 签名格式错误");
            }
        }

        int readLength() {
            int length = input.read();
            if ((length & 0x80) == 0) {
                return length;
            }
            int bytes = length & 0x7f;
            int value = 0;
            for (int i = 0; i < bytes; i += 1) {
                value = (value << 8) | input.read();
            }
            return value;
        }

        BigInteger readInteger() {
            expect(0x02);
            int length = readLength();
            byte[] value = new byte[length];
            int readLength = input.read(value, 0, length);
            if (readLength != length) {
                throw new IllegalStateException("DER 签名格式错误");
            }
            return new BigInteger(value);
        }
    }
}
