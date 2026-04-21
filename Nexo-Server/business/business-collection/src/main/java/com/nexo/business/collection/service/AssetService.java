package com.nexo.business.collection.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.interfaces.vo.AssetVO;
import com.nexo.common.api.nft.constant.AssetState;
import com.nexo.common.api.nft.request.AssetDestroyRequest;
import com.nexo.common.api.nft.request.AssetTransferRequest;

/**
 * 资产服务
 */
public interface AssetService extends IService<Asset> {

    /**
     * 获取资产列表
     */
    Page<AssetVO> getAssetList(String keyword, AssetState state, Long current, Long size);

    /**
     * 资产销毁
     */
    Asset destroy(AssetDestroyRequest request);

    /**
     * 资产转增
     */
    Asset transfer(AssetTransferRequest assetTransferRequest);
}
