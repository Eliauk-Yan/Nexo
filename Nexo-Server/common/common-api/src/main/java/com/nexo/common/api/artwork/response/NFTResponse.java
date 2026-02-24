package com.nexo.common.api.artwork.response;

import com.nexo.common.api.common.response.BaseResponse;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname NFTResponse
 * @description 藏品响应
 * @date 2026/02/24 00:13
 */
@Getter
@Setter
public class NFTResponse<T> extends BaseResponse {

    private T data;

}
