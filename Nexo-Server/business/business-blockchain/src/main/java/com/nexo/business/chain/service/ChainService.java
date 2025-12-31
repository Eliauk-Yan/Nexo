package com.nexo.business.chain.service;

import com.nexo.business.chain.domain.enums.ChainType;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;

public interface ChainService {

    ChainType supportType();

    ChainResponse<ChainCreateData> createChainAccount(ChainRequest request);

}
