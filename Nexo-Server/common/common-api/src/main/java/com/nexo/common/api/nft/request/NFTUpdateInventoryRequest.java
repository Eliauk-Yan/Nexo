package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.NFTEvent;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class NFTUpdateInventoryRequest extends NFTBaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long quantity;

    @Override
    public NFTEvent getEventType() {
        return NFTEvent.MODIFY_INVENTORY;
    }

}
