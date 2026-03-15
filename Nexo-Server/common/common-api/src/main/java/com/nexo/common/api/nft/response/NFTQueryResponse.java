package com.nexo.common.api.nft.response;

import com.nexo.common.base.response.BaseResponse;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * @classname ArtWorkResponse
 * @description 藏品响应类
 * @date 2026/01/09 10:30
 */
@Getter
@Setter
public class NFTQueryResponse<T> extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
