package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.AssetEvent;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class AssetActiveRequest extends AssetBaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private String nftId;

    private String txHash;

    @Override
    public AssetEvent getEventType() {
        return AssetEvent.ACTIVE;
    }
}
