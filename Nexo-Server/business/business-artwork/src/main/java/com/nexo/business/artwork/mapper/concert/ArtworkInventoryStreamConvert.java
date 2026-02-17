package com.nexo.business.artwork.mapper.concert;

import com.nexo.business.artwork.domain.entity.ArtworkInventoryStream;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryStreamDTO;
import org.mapstruct.Mapper;

/**
 * 藏品库存流水转换器
 */
@Mapper(componentModel = "spring")
public interface ArtworkInventoryStreamConvert {

    ArtworkInventoryStreamDTO toDTO(ArtworkInventoryStream artworkInventoryStream);
}
