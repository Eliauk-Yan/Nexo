package com.nexo.business.collection.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.interfaces.vo.NFTDetailVO;
import com.nexo.common.api.nft.request.NFTCreateRequest;
import com.nexo.common.api.nft.request.NFTRemoveRequest;
import com.nexo.common.api.nft.request.NFTUpdateInventoryRequest;
import com.nexo.common.api.nft.request.NFTUpdatePriceRequest;
import com.nexo.common.api.nft.response.NFTUpdateInventoryResponse;
import com.nexo.common.base.response.PageResponse;

public interface NFTService extends IService<NFT> {
    /**
     * 根据 ID 获取藏品详情
     */
    NFTDetailVO getNFTDetail(Long id);

    /**
     * 根据状态和关键字分页查询藏品
     */
    PageResponse<NFT> pageQueryByState(String state, String keyword, int current, int size);

    /**
     * 创建藏品
     */
    NFT create(NFTCreateRequest request);

    /**
     * 删除藏品
     */
    Boolean removeNFT(NFTRemoveRequest request);

    /**
     * 更新藏品价格
     */
    Boolean updatePrice(NFTUpdatePriceRequest request);

    /**
     * 更新藏品库存
     */
    NFTUpdateInventoryResponse updateInventory(NFTUpdateInventoryRequest request);
}
