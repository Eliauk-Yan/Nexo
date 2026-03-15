package com.nexo.business.collection.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.interfaces.dto.NFTPageQueryDTO;
import com.nexo.business.collection.interfaces.vo.NFTDetailVO;
import com.nexo.common.api.artwork.request.NFTCreateRequest;
import com.nexo.common.base.response.PageResponse;

public interface NFTService extends IService<NFT> {

    /**
     * 获取藏品分页列表
     */
    Page<NFT> queryPage(NFTPageQueryDTO queryDTO);

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
}
