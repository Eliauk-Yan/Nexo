package com.nexo.business.artwork.mapper.concert;

import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.interfaces.vo.ArtWorkInfoVO;
import com.nexo.business.artwork.interfaces.vo.ArtWorkVO;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * @classname ArtWorkConvertor
 * @description 藏品转换器
 * @date 2025/12/21 17:30
 */
@Mapper(componentModel = "spring")
public interface ArtWorkConvertor {

    ArtWorkVO toVO(ArtWork artWork);

    List<ArtWorkVO> toVOs(List<ArtWork> artWorkList);

    ArtWorkDTO toDTO(ArtWork artWork);

    List<ArtWorkDTO> toDTOs(List<ArtWork> artWorks);

    ArtWorkInfoVO toDetail(ArtWork artWork);

}
