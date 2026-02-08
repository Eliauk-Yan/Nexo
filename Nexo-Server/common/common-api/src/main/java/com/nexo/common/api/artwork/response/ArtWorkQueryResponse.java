package com.nexo.common.api.artwork.response;

import com.nexo.common.api.common.response.BaseResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname ArtWorkResponse
 * @description 藏品响应类
 * @date 2026/01/09 10:30
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ArtWorkQueryResponse<T> extends BaseResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
