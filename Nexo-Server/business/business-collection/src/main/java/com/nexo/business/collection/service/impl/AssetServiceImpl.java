package com.nexo.business.collection.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.collection.domain.entity.ArtWork;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.interfaces.vo.AssetVO;
import com.nexo.business.collection.mapper.mybatis.AssetMapper;
import com.nexo.business.collection.service.ArtWorkService;
import com.nexo.business.collection.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @classname AssetServiceImpl
 * @description 资产服务实现类
 * @date 2026/02/08 17:55
 */
@Service
@RequiredArgsConstructor
public class AssetServiceImpl extends ServiceImpl<AssetMapper, Asset> implements AssetService {

    private final ArtWorkService artWorkService;

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
                .map(Asset::getArtWorkId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, ArtWork> artworkMap = artWorkService.listByIds(artworkIds).stream()
                .collect(Collectors.toMap(ArtWork::getId, a -> a));

        // 4. 组装数据
        List<AssetVO> vos = assetPage.getRecords().stream().map(asset -> {
            AssetVO vo = new AssetVO();
            BeanUtils.copyProperties(asset, vo);
            vo.setState(asset.getState() != null ? asset.getState().name() : null);

            ArtWork artWork = artworkMap.get(asset.getArtWorkId());
            if (artWork != null) {
                vo.setArtworkName(artWork.getName());
                vo.setArtworkCover(artWork.getCover());
            }

            return vo;
        }).collect(Collectors.toList());

        voPage.setRecords(vos);
        return voPage;
    }
}
