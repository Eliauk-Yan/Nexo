package com.nexo.common.api.pay;

import com.nexo.common.api.pay.request.PayCreateRequest;
import com.nexo.common.api.pay.request.PayQueryRequest;
import com.nexo.common.api.pay.response.PayOrderDTO;
import com.nexo.common.api.pay.response.PayResponse;
import com.nexo.common.api.pay.response.data.PayOrderVO;
import com.nexo.common.base.response.MultiResponse;

/**
 * 支付模块Dubbo接口
 */
public interface PayFacade {

    /**
     * 创建支付单（生成支付参数）
     */
    PayResponse<PayOrderDTO> createPayOrder(PayCreateRequest request);

    /**
     * 查询支付单
     */
    MultiResponse<PayOrderVO> queryPayOrders(PayQueryRequest request);
}
