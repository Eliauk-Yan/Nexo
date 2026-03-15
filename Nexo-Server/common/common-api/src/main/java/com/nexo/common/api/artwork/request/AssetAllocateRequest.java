package com.nexo.common.api.artwork.request;

import com.nexo.common.base.request.BaseRequest;
import com.nexo.common.api.artwork.constant.NFTType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * @classname AssetAllocateRequest
 * @description 资产分发请求类
 * @date 2026/03/08
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class AssetAllocateRequest extends BaseRequest {

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
    private NFTType NFTType;

    /**
     * 购入价格
     */
    private BigDecimal purchasePrice;

    /**
     * 唯一幂等校验号
     */
    private String identifier;
}
