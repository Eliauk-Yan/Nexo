package com.nexo.business.collection.domain.entity;

import com.nexo.common.datasource.entity.BaseEntity;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class AssetStream extends BaseEntity {

    /**
     * 资产ID
     */
    private Long assetId;

    /**
     * 流水类型
     */
    private String streamType;

    /**
     * 操作者
     */
    private String operator;

    /**
     * 幂等号
     */
    private String identifier;

}
