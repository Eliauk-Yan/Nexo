package com.nexo.business.product.artwork.mapper.concert;

import com.nexo.business.product.artwork.domain.entity.ArtWork;
import com.nexo.business.product.artwork.interfaces.vo.ArtWorkInfoVO;
import com.nexo.business.product.artwork.interfaces.vo.ArtWorkVO;
import com.nexo.common.api.artwork.response.data.ArtWorkDetailData;
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

    ArtWorkDetailData toArtWorkDetailData(ArtWork artWork);

    ArtWorkInfoVO toArtWorkInfoVO(ArtWork artWork);
}
