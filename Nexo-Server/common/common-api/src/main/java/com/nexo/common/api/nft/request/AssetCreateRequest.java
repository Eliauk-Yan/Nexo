package com.nexo.common.api.nft.request;

import com.nexo.common.api.nft.constant.AssetEvent;
import com.nexo.common.base.request.BaseRequest;
import com.nexo.common.api.nft.constant.NFTType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.math.BigDecimal;

/**
 * @classname AssetAllocateRequest
 * @description 资产分发请求类
 * @date 2026/03/08
 */
@Getter
@Setter
public class AssetCreateRequest extends AssetBaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 所属业务订单号
     */
    private String businessNo;

    /**
     * 业务类型
     */
    private String businessType;

    /**
     * 买家ID
     */
    private Long buyerId;

    /**
     * 藏品ID
     */
    private Long artworkId;

    /**
     * 藏品类型
     */
    private NFTType nftType;

    /**
     * 购入价格
     */
    private BigDecimal purchasePrice;


    @Override
    public AssetEvent getEventType() {
        return AssetEvent.CREATE;
    }
}
