package com.nexo.business.collection.mapper.convert;

import com.nexo.business.collection.domain.entity.ArtWork;
import com.nexo.business.collection.domain.entity.ArtworkSnapshot;
import com.nexo.business.collection.domain.entity.ArtworkStream;
import com.nexo.business.collection.interfaces.vo.NFTDetailVO;
import com.nexo.business.collection.interfaces.vo.ArtWorkVO;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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

    NFTDetailVO toDetail(ArtWork artWork);

    @Mapping(source = "createdAt", target = "createTime")
    @Mapping(source = "version", target = "updateVersion")
    ArtworkSnapshot toSnapshot(ArtWork artWork);

    @Mapping(source = "createdAt", target = "createTime")
    ArtworkStream toStream(ArtWork artWork);
}
