package com.nexo.common.base.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class SingleResponse<T> extends BaseResponse{

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

    public static <T> SingleResponse<T> success(T data) {
        SingleResponse<T> singleResponse = new SingleResponse<>();
        singleResponse.setSuccess(true);
        singleResponse.setData(data);
        return singleResponse;
    }

    public static <T> SingleResponse<T> fail(String errorCode, String errorMessage) {
        SingleResponse<T> singleResponse = new SingleResponse<>();
        singleResponse.setSuccess(false);
        singleResponse.setCode(errorCode);
        singleResponse.setMessage(errorMessage);
        return singleResponse;
    }

}
