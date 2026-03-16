package com.nexo.business.collection.mapper.convert;

import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.entity.NFTSnapshot;
import com.nexo.business.collection.domain.entity.NFTStream;
import com.nexo.business.collection.interfaces.vo.NFTVO;
import com.nexo.common.api.nft.response.data.NFTDTO;
import com.nexo.common.api.nft.response.data.NFTInfo;
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

    NFTVO toVO(NFT NFT);

    List<NFTVO> toVOs(List<NFT> NFTList);

    NFTDTO toDTO(NFT NFT);

    List<NFTDTO> toDTOs(List<NFT> NFTS);

    NFTInfo toInfo(NFT NFT);

    @Mapping(source = "createdAt", target = "createTime")
    @Mapping(source = "version", target = "updateVersion")
    NFTSnapshot toSnapshot(NFT NFT);

    @Mapping(source = "createdAt", target = "createTime")
    NFTStream toStream(NFT NFT);
}
