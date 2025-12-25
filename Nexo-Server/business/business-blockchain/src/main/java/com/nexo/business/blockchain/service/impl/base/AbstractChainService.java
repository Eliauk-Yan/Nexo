package com.nexo.business.blockchain.service.impl.base;

import com.nexo.business.blockchain.constant.enums.ChainType;
import com.nexo.business.blockchain.service.ChainService;

/**
 * @classname AbstractChainService
 * @description 链服务抽象类
 * @date 2025/12/25 16:43
 */
public abstract class AbstractChainService implements ChainService {

    @Override
    public abstract ChainType supportType();
}
