package com.nexo.business.artwork.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.artwork.domain.dto.ArtWorkQueryDTO;
import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.domain.vo.ArtWorkDetailVO;
import com.nexo.business.artwork.domain.vo.ArtWorkVO;

public interface ArtWorkService extends IService<ArtWork> {

    Page<ArtWorkVO> getArtWorkVOList(ArtWorkQueryDTO queryDTO);

    ArtWorkDetailVO getArtWorkDetailById(Long id);
}
