package com.nexo.common.api.artwork.response;

import com.nexo.common.api.common.response.BaseResponse;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname NFTResponse
 * @description 藏品响应
 * @date 2026/02/24 00:13
 */
@Getter
@Setter
public class NFTResponse<T> extends BaseResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
