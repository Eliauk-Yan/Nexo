package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.NFTEvent;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.math.BigDecimal;

@Getter
@Setter
public class NFTUpdatePriceRequest extends NFTBaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private BigDecimal price;

    @Override
    public NFTEvent getEventType() {
        return NFTEvent.MODIFY_PRICE;
    }
}
