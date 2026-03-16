package com.nexo.common.api.nft.response;

import com.nexo.common.base.response.BaseResponse;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * @classname NFTResponse
 * @description 藏品响应
 * @date 2026/02/24 00:13
 */
@Getter
@Setter
public class NFTResponse<T> extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

    public static <T> NFTResponse<T> success(T data) {
        NFTResponse<T> response = new NFTResponse<>();
        response.setSuccess(true);
        response.setData(data);
        return response;
    }
}
