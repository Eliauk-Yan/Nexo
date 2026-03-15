package com.nexo.common.api.nft;

import com.nexo.common.api.nft.request.*;
import com.nexo.common.api.nft.response.NFTQueryResponse;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.nft.response.data.NFTDTO;
import com.nexo.common.api.nft.response.data.ArtworkInventoryDTO;
import com.nexo.common.api.nft.response.data.ArtworkInventoryStreamDTO;
import com.nexo.common.api.product.request.ProductSaleRequest;
import com.nexo.common.base.response.PageResponse;

public interface NFTFacade {

    /**
     * 根据id获取藏品
     * 
     * @param id 藏品id
     * @return 藏品信息
     */
    NFTQueryResponse<NFTDTO> getArtWorkById(Long id);

    /**
     * 根据id获取藏品库存
     * 
     * @param id 藏品id
     * @return 藏品库存信息
     */
    NFTQueryResponse<ArtworkInventoryDTO> getArtworkInventory(Long id);

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
     * 取消售卖 (回滚库存)
     * 
     * @param saleRequest 请求
     * @return 是否成功
     */
    Boolean unsale(ProductSaleRequest saleRequest);

    /**
     * 购买成功后分发资产并上链
     *
     * @param request 分发请求
     * @return 结果
     */
    Boolean allocateAsset(AssetAllocateRequest request);



    /**
     * 获取藏品分页
     */
    PageResponse<NFTDTO> queryPage(NFTPageQueryRequest request);

    /**
     * 新增藏品
     */
    NFTResponse<Boolean> addNFT(NFTCreateRequest request);

    /**
     * 删除藏品
     */
    NFTResponse<Long> removeNFT(NFTRemoveRequest request);

    /**
     * 更新藏品价格
     */
    NFTResponse<Long> updatePrice(NFTUpdatePriceRequest request);

    /**
     * 更新藏品库存
     */
    NFTResponse<Long> updateInventory(NFTUpdateInventoryRequest request);
}
