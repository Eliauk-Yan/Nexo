package com.nexo.business.trade.service;

import com.nexo.business.trade.interfaces.dto.BuyDTO;
import com.nexo.business.trade.interfaces.dto.PayDTO;
import com.nexo.business.trade.interfaces.vo.PayVO;

/**
 * 交易服务接口
 */
public interface TradeService {

    /**
     * 基于 RocketMQ 方案实现的下单
     */
    String buy(BuyDTO params);

    /**
     * 支付
     */
    PayVO pay(PayDTO payParams);
}
