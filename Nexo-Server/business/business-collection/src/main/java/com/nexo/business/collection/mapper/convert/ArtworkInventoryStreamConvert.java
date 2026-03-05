package com.nexo.business.collection.mapper.convert;

import com.nexo.business.collection.domain.entity.ArtworkInventoryStream;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryStreamDTO;
import org.mapstruct.Mapper;

/**
 * 藏品库存流水转换器
 */
@Mapper(componentModel = "spring")
public interface ArtworkInventoryStreamConvert {

    ArtworkInventoryStreamDTO toDTO(ArtworkInventoryStream artworkInventoryStream);
}
