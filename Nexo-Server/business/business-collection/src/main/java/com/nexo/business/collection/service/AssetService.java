package com.nexo.business.collection.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.interfaces.vo.AssetVO;

/**
 * 资产服务
 */
public interface AssetService extends IService<Asset> {

    // 获取资产列表
    Page<AssetVO> getMyAssets(Long current, Long size);

    // 激活资产
    boolean activateAsset(Long assetId, String transactionHash);
}
