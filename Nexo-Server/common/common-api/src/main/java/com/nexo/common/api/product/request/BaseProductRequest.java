package com.nexo.common.api.product.request;

import com.nexo.common.api.common.request.BaseRequest;
import com.nexo.common.api.product.constant.ProductEvent;
import com.nexo.common.api.product.constant.ProductType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @classname BaseProductRequest
 * @description 商品模块Dubbo请求基类
 * @date 2026/02/16 02:25
 */
@Getter
@Setter
public abstract class BaseProductRequest extends BaseRequest {

    /**
     * 幂等号
     */
    @NotNull(message = "幂等号不能为空")
    private String identifier;

    /**
     * 藏品id
     */
    private Long productId;

    /**
     * 藏品类型
     */
    private ProductType productType;

    /**
     * 获取事件类型
     */
    public abstract ProductEvent getEventType();

}
