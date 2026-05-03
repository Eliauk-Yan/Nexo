package com.nexo.business.pay.api.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/**
 * Apple signedTransactionInfo 解码后的关键字段。
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppleIapTransactionResponse {

    private String transactionId;

    private String originalTransactionId;

    private String bundleId;

    private String productId;

    private String environment;

    private String type;

    private Long purchaseDate;

    private Long revocationDate;

    private Long quantity;
}
