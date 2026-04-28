package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.AssetEvent;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class AssetTransferRequest extends AssetBaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 接受人ID
     */
    private String recipeId;

    /**
     * 操作人ID
     */
    private String operator;

    @Override
    public AssetEvent getEventType() {
        return AssetEvent.TRANSFER;
    }
}
