package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.NFTEvent;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname NFTCreateRequest
 * @description
 * @date 2026/02/24 00:09
 */
@Getter
@Setter
public class NFTCreateRequest extends NFTBaseRequest {

    private String name;

    private String cover;

    private BigDecimal price;

    private Long quantity;

    private LocalDateTime saleTime;

    private String description;

    private Long creatorId;

    @Override
    public NFTEvent getEventType() {
        return NFTEvent.CHAIN;
    }
}
