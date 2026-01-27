package com.nexo.business.product.artwork.interfaces.facade;

import com.nexo.business.product.artwork.domain.entity.ArtWork;
import com.nexo.business.product.artwork.mapper.concert.ArtWorkConvertor;
import com.nexo.business.product.artwork.service.ArtWorkService;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.ArtWorkResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDetailData;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboService;

/**
 * @classname ArtWorkFacadeImpl
 * @description 藏品模块对外接口实现类
 * @date 2026/01/09 10:14
 */
@DubboService
@RequiredArgsConstructor
public class ArtWorkFacadeImpl implements ArtWorkFacade {

    private final ArtWorkService artWorkService;

    private final ArtWorkConvertor artWorkConvertor;

    @Override
    public ArtWorkResponse<ArtWorkDetailData> getArtWork(Long id) {
        // 1. 查询藏品
        ArtWork artwork = artWorkService.getArtWorkById(id);
        // 2. 转换数据
        ArtWorkDetailData data = artWorkConvertor.toArtWorkDetailData(artwork);
        // 3. 封装并返回数据
        ArtWorkResponse<ArtWorkDetailData> response = new ArtWorkResponse<>();
        response.setData(data);
        return response;
    }
}
