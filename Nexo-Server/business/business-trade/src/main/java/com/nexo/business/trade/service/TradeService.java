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
     * @param params 下单参数
     * @return 订单ID
     */
    String buy(BuyDTO params);

    /**
     * 支付
     * @param payParams 支付参数
     * @return 支付情况
     */
    PayVO pay(PayDTO payParams);
}
