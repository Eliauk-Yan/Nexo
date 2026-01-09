package com.nexo.common.api.artwork;

import com.nexo.common.api.artwork.response.ArtWorkResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDetailData;

public interface ArtWorkFacade {

    ArtWorkResponse<ArtWorkDetailData> getArtWork(Long id);

}
