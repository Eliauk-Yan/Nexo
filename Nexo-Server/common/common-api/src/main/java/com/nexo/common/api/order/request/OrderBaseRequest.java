package com.nexo.common.api.order.request;

import com.nexo.common.api.common.request.BaseRequest;
import com.nexo.common.api.order.constant.TradeOrderEvent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname OrderBaseRequest
 * @description 订单模块请求基类
 * @date 2026/02/06 01:14
 */
@Getter
@Setter
public abstract class OrderBaseRequest extends BaseRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 幂等号
     */
    @NotNull(message = "identifier 不能为空")
    private String identifier;

    /**
     * 获取订单事件
     */
    public abstract TradeOrderEvent getOrderEvent();

}
