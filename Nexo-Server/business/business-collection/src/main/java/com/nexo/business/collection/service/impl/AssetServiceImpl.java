package com.nexo.business.collection.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.domain.entity.AssetStream;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.exception.NFTException;
import com.nexo.business.collection.interfaces.vo.AssetVO;
import com.nexo.business.collection.mapper.mybatis.AssetMapper;
import com.nexo.business.collection.mapper.mybatis.AssetStreamMapper;
import com.nexo.business.collection.service.AssetService;
import com.nexo.business.collection.service.NFTService;
import com.nexo.common.api.nft.constant.AssetEvent;
import com.nexo.common.api.nft.constant.AssetState;
import com.nexo.common.api.nft.request.AssetDestroyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @Override
    public Page<AssetVO> getMyAssets(Long current, Long size) {
        Long userId = StpUtil.getLoginIdAsLong();

        // 1. 分页查询当前用户的资产
        Page<Asset> pageReq = new Page<>(current, size);
        LambdaQueryWrapper<Asset> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Asset::getCurrentHolderId, userId);
        wrapper.orderByDesc(Asset::getCreatedAt);
        Page<Asset> assetPage = this.page(pageReq, wrapper);

        // 2. 转换成VO
        Page<AssetVO> voPage = new Page<>(assetPage.getCurrent(), assetPage.getSize(), assetPage.getTotal());

        if (assetPage.getRecords().isEmpty()) {
            voPage.setRecords(Collections.emptyList());
            return voPage;
        }

        // 3. 提取所有的 artworkId 并批量查询 ArtWork 信息
        List<Long> artworkIds = assetPage.getRecords().stream()
                .map(Asset::getNftId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, NFT> artworkMap = NFTService.listByIds(artworkIds).stream()
                .collect(Collectors.toMap(NFT::getId, a -> a));

        // 4. 组装数据
        List<AssetVO> vos = assetPage.getRecords().stream().map(asset -> {
            AssetVO vo = new AssetVO();
            BeanUtils.copyProperties(asset, vo);
            vo.setState(asset.getState() != null ? asset.getState().name() : null);

            NFT NFT = artworkMap.get(asset.getNftId());
            if (NFT != null) {
                vo.setArtworkName(NFT.getName());
                vo.setArtworkCover(NFT.getCover());
            }

            return vo;
        }).collect(Collectors.toList());

        voPage.setRecords(vos);
        return voPage;
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
        assetStream.setIdentifier(request.getIdentify());
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
}
