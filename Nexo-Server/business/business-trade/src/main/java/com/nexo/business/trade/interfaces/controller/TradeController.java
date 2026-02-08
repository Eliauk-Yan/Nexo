package com.nexo.business.trade.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.business.trade.interfaces.dto.BuyDTO;
import com.nexo.business.trade.service.TradeService;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
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

    @PostMapping("buy")
    public Result<String> buy(@RequestBody BuyDTO params) {
        return Result.success(tradeService.buy(params));
    }

}
