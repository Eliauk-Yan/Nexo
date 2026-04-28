package com.nexo.business.collection.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.alibaba.nacos.common.utils.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.domain.entity.AssetStream;
import com.nexo.business.collection.domain.exception.NFTException;
import com.nexo.business.collection.interfaces.vo.AssetVO;
import com.nexo.business.collection.mapper.mybatis.AssetMapper;
import com.nexo.business.collection.mapper.mybatis.AssetStreamMapper;
import com.nexo.business.collection.service.AssetService;
import com.nexo.business.collection.service.NFTService;
import com.nexo.common.api.nft.constant.AssetEvent;
import com.nexo.common.api.nft.constant.AssetState;
import com.nexo.common.api.nft.constant.ProductSaleBizType;
import com.nexo.common.api.nft.request.AssetDestroyRequest;
import com.nexo.common.api.nft.request.AssetTransferRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static com.nexo.business.collection.domain.exception.NFTErrorCode.*;

/**
 * @classname AssetServiceImpl
 * @description 资产服务实现类
 * @date 2026/02/08 17:55
 */
@Service
@RequiredArgsConstructor
public class AssetServiceImpl extends ServiceImpl<AssetMapper, Asset> implements AssetService {

    private final NFTService NFTService;

    private final AssetStreamMapper assetStreamMapper;

    private final AssetMapper assetMapper;

    @Override
    public Page<AssetVO> getAssetList(String keyword, AssetState state, Long current, Long size) {
        // 1. 查询资产列表
        Long userId = StpUtil.getLoginIdAsLong();
        Page<AssetVO> page = new Page<>(current, size);
        return assetMapper.getAssetList(page, userId, StringUtils.hasText(keyword) ? keyword.trim() : null, state == null ? null : state.name());
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Asset destroy(AssetDestroyRequest request) {
        // 1. 查找并校验要销毁的资产
        Asset asset = this.getById(request.getAssetId());
        if (asset == null) {
            throw new NFTException(ASSET_QUERY_FAILED);
        }
        if (!asset.getCurrentHolderId().toString().equals(request.getOperator())) {
            throw new NFTException(ASSET_CHECK_ERROR);
        }
        if (asset.getState() == AssetState.DESTROYING || asset.getState() == AssetState.DESTROYED) {
            return asset;
        }
        // 2. 状态转移
        asset.destroying();
        // 3. 创建资产流水
        AssetStream assetStream = new AssetStream();
        assetStream.setAssetId(asset.getId());
        assetStream.setIdentifier(request.getIdentifier());
        assetStream.setOperator(request.getOperator());
        assetStream.setStreamType(AssetEvent.DESTROY.getCode());
        boolean result = this.updateById(asset);
        if (!result) {
            throw new NFTException(ASSET_UPDATE_FAILED);
        }
        boolean saveResult = assetStreamMapper.insert(assetStream) == 1;
        if (!saveResult) {
            throw new NFTException(ASSET_STREAM_SAVE_FAILED);
        }
        return asset;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Asset transfer(AssetTransferRequest assetTransferRequest) {
        // 1. 查询资产并校验
        Asset oldAsset = this.getById(assetTransferRequest.getAssetId());
        if (oldAsset == null) {
            throw new NFTException(ASSET_QUERY_FAILED);
        }
        if (oldAsset.getState() != AssetState.ACTIVE) {
            throw new NFTException(ASSET_CHECK_ERROR);
        }
        if (!oldAsset.getCurrentHolderId().toString().equals(assetTransferRequest.getOperator())) {
            throw new NFTException(ASSET_CHECK_ERROR);
        }
        // 2. 原资产失效 更新状态并添加流水
        oldAsset.inactive();
        boolean inactiveRes = this.updateById(oldAsset);
        if (!inactiveRes) {
            throw new NFTException(ASSET_UPDATE_FAILED);
        }
        AssetStream assetStream = new AssetStream();
        assetStream.setAssetId(oldAsset.getId());
        assetStream.setOperator(assetTransferRequest.getOperator());
        assetStream.setStreamType(AssetEvent.TRANSFER.getCode() + "_OUT");
        assetStream.setIdentifier(assetTransferRequest.getIdentifier());
        boolean assetStreamSaveRes = assetStreamMapper.insert(assetStream) == 1;
        if (!assetStreamSaveRes) {
            throw new NFTException(ASSET_STREAM_SAVE_FAILED);
        }
        // 3. 新资产生成 创建新资产并添加流水
        Asset newAsset = new Asset();
        BeanUtils.copyProperties(oldAsset, newAsset);
        newAsset.setId(null);
        newAsset.setCreatedAt(null);
        newAsset.setUpdatedAt(null);
        newAsset.setVersion(null);
        newAsset.setDeleted(null);
        newAsset.setCurrentHolderId(Long.parseLong(assetTransferRequest.getRecipeId()));
        newAsset.setState(AssetState.INIT);
        newAsset.setHoldTime(LocalDateTime.now());
        newAsset.setBusinessType(ProductSaleBizType.TRANSFER);
        newAsset.setPreviousHolderId(oldAsset.getCurrentHolderId());
        boolean newAssetInsertRes = this.save(newAsset);
        if (!newAssetInsertRes) {
            throw new NFTException(ASSET_UPDATE_FAILED);
        }
        AssetStream saveAssetStream = new AssetStream();
        saveAssetStream.setAssetId(newAsset.getId());
        saveAssetStream.setOperator(assetTransferRequest.getOperator());
        saveAssetStream.setStreamType(AssetEvent.TRANSFER.getCode() + "_IN");
        saveAssetStream.setIdentifier(assetTransferRequest.getIdentifier());
        boolean saveAssetStreamRes = assetStreamMapper.insert(saveAssetStream) == 1;
        if (!saveAssetStreamRes) {
            throw new NFTException(ASSET_STREAM_SAVE_FAILED);
        }
        return newAsset;
    }
}
