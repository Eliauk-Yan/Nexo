package com.nexo.business.trade.interfaces.controller;

import com.nexo.business.trade.interfaces.dto.BuyDTO;
import com.nexo.business.trade.interfaces.dto.PayDTO;
import com.nexo.business.trade.interfaces.vo.PayVO;
import com.nexo.business.trade.service.TradeService;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @classname TradeController
 * @description 交易模块控制器
 * @date 2026/02/02 23:59
 */
@RestController
@RequestMapping("/trade")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    /**
     * 购买藏品
     */
    @PostMapping("/buy")
    public Result<String> buy(@Validated @RequestBody BuyDTO buyParams) {
        return Result.success(tradeService.buy(buyParams));
    }

    /**
     * 支付
     */
    @PostMapping("/pay")
    public Result<PayVO> pay(@Validated @RequestBody PayDTO payParams) {
        return Result.success(tradeService.pay(payParams));
    }


}
