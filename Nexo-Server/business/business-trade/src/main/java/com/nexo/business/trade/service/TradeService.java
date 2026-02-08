package com.nexo.business.trade.service;

import com.nexo.business.trade.interfaces.dto.BuyDTO;

/**
 * 交易服务接口
 */
public interface TradeService {

    /**
     * 基于 RocketMQ 方案实现的下单
     * @param params 下单参数
     * @return 订单ID
     */
    String buy(BuyDTO params);
}
