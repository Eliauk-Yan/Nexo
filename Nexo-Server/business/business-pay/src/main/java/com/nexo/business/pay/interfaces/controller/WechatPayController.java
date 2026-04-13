package com.nexo.business.pay.interfaces.controller;

import com.nexo.business.pay.channel.service.WechatPayChannelServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/wxPay")
@RequiredArgsConstructor
public class WechatPayController {

    private final WechatPayChannelServiceImpl wechatPayChannelService;

    @RequestMapping(value = "/payNotify", method = {RequestMethod.POST, RequestMethod.GET})
    public void payNotify(HttpServletRequest request, HttpServletResponse response) {
        boolean result = wechatPayChannelService.notify(request, response);
        if (!result) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
