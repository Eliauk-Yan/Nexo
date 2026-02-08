package com.nexo.business.artwork.interfaces.facade;

import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.mapper.concert.ArtWorkConvertor;
import com.nexo.business.artwork.service.ArtWorkService;
import com.nexo.business.artwork.service.ArtworkInventoryStreamService;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;
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
    public ArtWorkQueryResponse<ArtWorkDTO> getArtWorkById(Long id) {
        // 1. 查询藏品
        ArtWork artwork = artWorkService.getArtWorkById(id);
        // 2. 转换数据
        ArtWorkDTO data = artWorkConvertor.toDTO(artwork);
        // 3. 封装并返回数据
        ArtWorkQueryResponse<ArtWorkDTO> response = new ArtWorkQueryResponse<>();
        response.setData(data);
        return response;
    }

    @Override
    public ArtWorkQueryResponse<ArtworkInventoryDTO> getArtworkInventory(Long id) {
        // 1. 查询藏品
        ArtWork artwork = artWorkService.getArtWorkById(id);
        // 2. 构造数据
        ArtworkInventoryDTO dto = new ArtworkInventoryDTO();
        dto.setQuantity(artwork.getQuantity());
        // TODO 临时处理 后续需要从Redis中获取可售库存
        dto.setSaleableInventory(artwork.getSaleableInventory());
        // 3. 封装并返回数据
        ArtWorkQueryResponse<ArtworkInventoryDTO> response = new ArtWorkQueryResponse<>();
        response.setData(dto);
        return response;
    }
}
