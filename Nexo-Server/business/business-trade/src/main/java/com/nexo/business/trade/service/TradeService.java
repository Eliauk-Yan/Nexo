package com.nexo.business.trade.service;

import com.nexo.business.trade.interfaces.dto.BuyDTO;
import com.nexo.business.trade.interfaces.dto.CancelParam;
import com.nexo.business.trade.interfaces.dto.PayDTO;
import com.nexo.business.trade.interfaces.vo.PayVO;
import jakarta.validation.Valid;

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

    /**
     * 主动关单
     */
    Boolean cancel(@Valid CancelParam param);
}
