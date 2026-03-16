package com.nexo.common.api.nft;

import com.nexo.common.api.nft.request.*;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.nft.response.data.NFTDTO;
import com.nexo.common.api.nft.response.data.NFTInfo;
import com.nexo.common.api.nft.response.data.NFTInventoryStreamDTO;
import com.nexo.common.base.response.PageResponse;

public interface NFTFacade {

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

    /**
     * 根据id获取藏品
     */
    NFTResponse<NFTInfo> getNFTInfoById(Long id);

    /**
     * 获取数据库藏品库存流水
     */
    NFTResponse<NFTInventoryStreamDTO> getNFTInventoryStream(Long productId, String identifier);

    /**
     * 藏品售卖
     */
    NFTResponse<Boolean> sale(NFTSaleRequest request);

    /**
     * 取消售卖 (回滚库存)
     */
    NFTResponse<Boolean> unsale(NFTSaleRequest request);
}
