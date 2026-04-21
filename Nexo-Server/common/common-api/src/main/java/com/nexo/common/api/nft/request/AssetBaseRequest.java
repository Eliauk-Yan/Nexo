package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.AssetEvent;
import com.nexo.common.api.nft.constant.AssetState;
import com.nexo.common.base.request.BaseRequest;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public abstract class AssetBaseRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private String identify;

    private String assetId;

    public abstract AssetEvent getEventType();

}
