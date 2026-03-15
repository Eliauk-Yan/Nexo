package com.nexo.business.collection.mapper.convert;

import com.nexo.business.collection.domain.entity.NFTSnapshot;
import com.nexo.business.collection.domain.entity.NFTStream;
import com.nexo.business.collection.interfaces.vo.NFTVO;
import com.nexo.business.collection.interfaces.vo.NFTDetailVO;
import com.nexo.common.api.nft.response.data.NFTDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * @classname NFTConvertor
 * @description 藏品转换器
 * @date 2025/12/21 17:30
 */
@Mapper(componentModel = "spring")
public interface NFTConvertor {

    NFTVO toVO(com.nexo.business.collection.domain.entity.NFT NFT);

    List<NFTVO> toVOs(List<com.nexo.business.collection.domain.entity.NFT> NFTList);

    NFTDTO toDTO(com.nexo.business.collection.domain.entity.NFT NFT);

    List<NFTDTO> toDTOs(List<com.nexo.business.collection.domain.entity.NFT> NFTS);

    NFTDetailVO toDetail(com.nexo.business.collection.domain.entity.NFT NFT);

    @Mapping(source = "createdAt", target = "createTime")
    @Mapping(source = "version", target = "updateVersion")
    NFTSnapshot toSnapshot(com.nexo.business.collection.domain.entity.NFT NFT);

    @Mapping(source = "createdAt", target = "createTime")
    NFTStream toStream(com.nexo.business.collection.domain.entity.NFT NFT);
}
