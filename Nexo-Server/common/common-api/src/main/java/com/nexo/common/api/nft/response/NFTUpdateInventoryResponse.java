package com.nexo.common.api.nft.response;

import com.nexo.common.api.nft.constant.NFTInventoryUpdateType;
import com.nexo.common.base.response.BaseResponse;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class NFTUpdateInventoryResponse extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long nftId;

    private NFTInventoryUpdateType updateType;

    private Long quantityModified;

    public static NFTUpdateInventoryResponse success(Long nftId, NFTInventoryUpdateType updateType, Long quantityModified) {
        NFTUpdateInventoryResponse response = new NFTUpdateInventoryResponse();
        response.setNftId(nftId);
        response.setUpdateType(updateType);
        response.setQuantityModified(quantityModified);
        response.setSuccess(true);
        return response;
    }

}
