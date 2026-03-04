package com.nexo.business.artwork.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.artwork.interfaces.dto.ArtWorkQueryDTO;
import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.interfaces.vo.NFTDetailVO;
import com.nexo.business.artwork.interfaces.vo.ArtWorkVO;

public interface ArtWorkService extends IService<ArtWork> {

    Page<ArtWorkVO> getArtWorkVOList(ArtWorkQueryDTO queryDTO);

    ArtWork getArtWorkById(Long id);

    /**
     * 通过藏品ID获取数字藏品详情
     * @param id 数字藏品ID
     * @return 数字藏品详情
     */
    NFTDetailVO getNFTDetailById(Long id);
}
