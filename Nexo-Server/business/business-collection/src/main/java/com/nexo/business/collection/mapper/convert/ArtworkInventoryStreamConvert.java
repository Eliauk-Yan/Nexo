package com.nexo.business.collection.mapper.convert;

import com.nexo.business.collection.domain.entity.NFTInventoryStream;
import com.nexo.common.api.nft.response.data.NFTInventoryStreamDTO;
import org.mapstruct.Mapper;

/**
 * 藏品库存流水转换器
 */
@Mapper(componentModel = "spring")
public interface ArtworkInventoryStreamConvert {

    NFTInventoryStreamDTO toDTO(NFTInventoryStream nftInventoryStream);
}
