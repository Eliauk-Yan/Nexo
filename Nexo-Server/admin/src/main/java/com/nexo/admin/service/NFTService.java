package com.nexo.admin.service;

import com.nexo.admin.domain.param.NFTCreateParam;
import com.nexo.admin.domain.param.NFTQueryParam;
import com.nexo.admin.domain.param.NFTUpdateParam;
import com.nexo.admin.domain.vo.NFTVO;
import com.nexo.common.web.result.MultiResult;
import org.springframework.web.multipart.MultipartFile;

/**
 * 数字藏品后台服务接口
 */
public interface NFTService {

    /**
     * 获取NFT列表
     */
    MultiResult<NFTVO> getNFTList(NFTQueryParam dto);

    /**
     * 发布NFT
     */
    Boolean addNFT(NFTCreateParam dto);

    /**
     * 上传文件
     */
    String uploadNFT(MultipartFile file);

    /**
     * 下架NFT
     */
    Boolean deleteNFT(Long id);

    /**
     * 修改价格
     */
    Boolean updatePrice(NFTUpdateParam param);

    /**
     * 修改库存
     */
    Boolean updateInventory(NFTUpdateParam param);
}
