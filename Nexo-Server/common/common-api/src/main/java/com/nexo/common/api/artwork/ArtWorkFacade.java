package com.nexo.common.api.artwork;

import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;

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


}
