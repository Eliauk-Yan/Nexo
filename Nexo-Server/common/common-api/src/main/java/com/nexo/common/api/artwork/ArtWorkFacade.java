package com.nexo.common.api.artwork;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.common.api.artwork.request.ArtWorkQueryRequest;
import com.nexo.common.api.artwork.request.NFTCreateRequest;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.NFTResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryStreamDTO;
import com.nexo.common.api.product.request.ProductSaleRequest;


public interface ArtWorkFacade {

    /**
     * 根据id获取藏品
     * 
     * @param id 藏品id
     * @return 藏品信息
     */
    ArtWorkQueryResponse<ArtWorkDTO> getArtWorkById(Long id);

    /**
     * 根据id获取藏品库存
     * 
     * @param id 藏品id
     * @return 藏品库存信息
     */
    ArtWorkQueryResponse<ArtworkInventoryDTO> getArtworkInventory(Long id);

    /**
     * 查询藏品库存流水 TODO 后续优化返回值类型
     * 
     * @param productId  商品ID
     * @param identifier 幂等号
     * @return 商品库存流水
     */
    ArtworkInventoryStreamDTO getArtworkInventoryStream(Long productId, String identifier);

    /**
     * 藏品售卖
     * 
     * @param saleRequest 请求
     * @return 是否成功
     */
    Boolean sale(ProductSaleRequest saleRequest);

    /**
     * 获取藏品列表
     * 
     * @return 藏品列表
     */
    ArtWorkQueryResponse<Page<ArtWorkDTO>> getNFTList(ArtWorkQueryRequest request);

    /**
     * 新增藏品
     */
    NFTResponse<Boolean> addNFT(NFTCreateRequest request);

    /**
     * 更新藏品
     */
    Boolean updateNFT(ArtWorkDTO artWorkDTO);

    /**
     * 删除藏品
     */
    Boolean deleteNFT(Long id);

    /**
     * 更新状态
     */
    Boolean updateState(Long id, String state);
}
