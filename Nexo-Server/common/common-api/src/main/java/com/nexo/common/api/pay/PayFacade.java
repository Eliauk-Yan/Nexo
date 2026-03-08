package com.nexo.common.api.pay;

import com.nexo.common.api.pay.request.PayCreateRequest;
import com.nexo.common.api.pay.response.PayOrderDTO;
import com.nexo.common.api.pay.response.PayResponse;

/**
 * 支付模块Dubbo接口
 */
public interface PayFacade {

    /**
     * 创建支付单（生成支付链接）
     *
     * @param request 支付创建请求
     * @return 支付响应（含支付链接）
     */
    PayResponse<PayOrderDTO> createPayOrder(PayCreateRequest request);

    /**
     * 查询支付单
     *
     * @param payOrderId 支付单号
     * @return 支付单信息
     */
    PayResponse<PayOrderDTO> queryPayOrder(String payOrderId);
}
