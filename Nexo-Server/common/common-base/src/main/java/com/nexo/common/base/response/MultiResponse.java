package com.nexo.common.base.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.util.List;

@Getter
@Setter
public class MultiResponse<T> extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private List<T> data;

    public static <T> MultiResponse<T> success(List<T> data) {
        MultiResponse<T> multiResponse = new MultiResponse<>();
        multiResponse.setSuccess(true);
        multiResponse.setData(data);
        return multiResponse;
    }
}
