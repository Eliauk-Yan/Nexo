package com.nexo.admin.service;

import com.nexo.admin.domain.dto.NFTCreateDTO;
import com.nexo.admin.domain.dto.NFTQueryDTO;
import com.nexo.admin.domain.dto.NFTUpdateDTO;
import com.nexo.admin.domain.vo.NFTVO;
import com.nexo.common.web.result.MultiResult;
import org.springframework.web.multipart.MultipartFile;

/**
 * 数字藏品服务接口
 */
public interface NFTService {

    MultiResult<NFTVO> getNFTList(NFTQueryDTO dto);

    Boolean addNFT(NFTCreateDTO dto);

    Boolean updateNFT(NFTUpdateDTO dto);

    Boolean deleteNFT(Long id);

    String uploadNFT(MultipartFile file);
}
