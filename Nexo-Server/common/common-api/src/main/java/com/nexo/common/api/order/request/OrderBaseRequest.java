package com.nexo.common.api.order.request;

import com.nexo.common.api.common.request.BaseRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname OrderBaseRequest
 * @description 订单模块请求基类
 * @date 2026/02/06 01:14
 */
@Getter
@Setter
public class OrderBaseRequest extends BaseRequest {

    /**
     * 幂等号
     */
    @NotNull(message = "identifier 不能为空")
    private String identifier;

}
