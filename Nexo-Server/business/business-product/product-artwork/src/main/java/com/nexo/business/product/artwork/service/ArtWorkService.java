package com.nexo.business.product.artwork.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.product.artwork.interfaces.dto.ArtWorkQueryDTO;
import com.nexo.business.product.artwork.domain.entity.ArtWork;
import com.nexo.business.product.artwork.interfaces.vo.ArtWorkInfoVO;
import com.nexo.business.product.artwork.interfaces.vo.ArtWorkVO;

public interface ArtWorkService extends IService<ArtWork> {

    Page<ArtWorkVO> getArtWorkVOList(ArtWorkQueryDTO queryDTO);

    ArtWork getArtWorkById(Long id);

    ArtWorkInfoVO getArtWorkDetailById(Long id);
}
