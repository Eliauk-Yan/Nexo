package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.AssetEvent;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class AssetDestroyRequest extends AssetBaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 操作人Id
     */
    private String operator;

    @Override
    public AssetEvent getEventType() {
        return AssetEvent.DESTROY;
    }
}
