package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.NFTEvent;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NFTCancelSaleRequest extends NFTBaseRequest {

    private Integer quantity;

    @Override
    public NFTEvent getEventType() {
        return NFTEvent.CANCEL_SALE;
    }
}
