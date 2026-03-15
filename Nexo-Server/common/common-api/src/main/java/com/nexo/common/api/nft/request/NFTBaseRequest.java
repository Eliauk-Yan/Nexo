package com.nexo.common.api.nft.request;

import com.nexo.common.base.request.BaseRequest;
import com.nexo.common.api.nft.constant.NFTEvent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * @classname NFTBaseRequest
 * @description 数字藏品请求基类
 * @date 2026/02/24 01:31
 */
@Getter
@Setter
public abstract class NFTBaseRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "幂等号不能为空")
    private String identifier;

    private Long NFTId;

    public abstract NFTEvent getEventType();

}
