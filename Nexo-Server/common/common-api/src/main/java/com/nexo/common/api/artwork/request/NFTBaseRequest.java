package com.nexo.common.api.artwork.request;

import com.nexo.common.base.request.BaseRequest;
import com.nexo.common.api.artwork.constant.NFTEvent;
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

    @NotNull(message = "幂等号不能为空")
    private String identifier;

    private Long NFTId;

    /**
     * 获取事件类型
     */
    public abstract NFTEvent getEventType();

}
