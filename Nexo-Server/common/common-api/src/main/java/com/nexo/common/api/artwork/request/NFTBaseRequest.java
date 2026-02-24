package com.nexo.common.api.artwork.request;

import com.nexo.common.api.common.request.BaseRequest;
import com.nexo.common.api.product.constant.ProductEvent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname NFTBaseRequest
 * @description 数字藏品请求基类
 * @date 2026/02/24 01:31
 */
@Getter
@Setter
public abstract class NFTBaseRequest extends BaseRequest {

    /**
     * 幂等号
     */
    @NotNull(message = "幂等号不能为空")
    private String identifier;

    /**
     * 藏品id
     */
    private Long artworkId;

    /**
     * 获取事件类型
     * @return 事件类型
     */
    public abstract ProductEvent getEventType();

}
