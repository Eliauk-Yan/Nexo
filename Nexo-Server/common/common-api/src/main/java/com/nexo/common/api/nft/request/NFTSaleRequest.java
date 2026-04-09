package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.NFTEvent;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.nft.constant.ProductSaleBizType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class NFTSaleRequest extends NFTBaseRequest {

    private String name;

    private NFTType nftType;

    private String cover;

    private BigDecimal purchasePrice;

    private String userId;

    private Long quantity;

    private String bizNo;

    private ProductSaleBizType bizType;

    @Override
    public NFTEvent getEventType() {
        return NFTEvent.SALE;
    }
}
