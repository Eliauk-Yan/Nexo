package com.nexo.business.artwork.mapper.concert;

import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.interfaces.vo.ArtWorkDetailVO;
import com.nexo.business.artwork.interfaces.vo.ArtWorkVO;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * @classname ArtWorkConvertor
 * @description 藏品转换器
 * @date 2025/12/21 17:30
 */
@Mapper(componentModel = "spring")
public interface ArtWorkConvertor {

    ArtWorkVO toArtWorkVO(ArtWork artWork);

    List<ArtWorkVO> toArtWorkVOList(List<ArtWork> artWorkList);

    ArtWorkDetailVO toArtWorkDetailVO(ArtWork artWork);
}
