package com.nexo.business.collection.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.interfaces.vo.AssetVO;

/**
 * 资产服务
 */
public interface AssetService extends IService<Asset> {

    Page<AssetVO> getMyAssets(Long current, Long size);

    Asset getByBusinessNo(String businessNo, String businessType);

    boolean activateAsset(Long assetId, String transactionHash);
}
