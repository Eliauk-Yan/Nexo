package com.nexo.admin.service;

import com.nexo.admin.domain.dto.NFTQueryDTO;
import com.nexo.admin.domain.vo.NFTVO;
import com.nexo.common.web.result.MultiResult;

/**
 * 数字藏品服务接口
 */
public interface NFTService {

    MultiResult<NFTVO> getNFTList(NFTQueryDTO dto);

    Boolean addNFT(com.nexo.admin.domain.dto.NFTCreateDTO dto);

    Boolean updateNFT(com.nexo.admin.domain.dto.NFTUpdateDTO dto);

    Boolean deleteNFT(Long id);

    Boolean updateState(Long id, String state);

}
