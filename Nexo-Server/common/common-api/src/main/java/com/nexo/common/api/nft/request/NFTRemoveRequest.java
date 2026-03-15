package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.NFTEvent;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class NFTRemoveRequest extends NFTBaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    @Override
    public NFTEvent getEventType() {
        return NFTEvent.REMOVE;
    }
}
