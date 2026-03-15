package com.nexo.common.api.user.response;

import com.nexo.common.base.response.BaseResponse;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * @classname UserQueryResponse
 * @description 用户查询响应类
 * @date 2025/12/03 12:46
 * @created by YanShijie
 */
@Getter
@Setter
public class UserQueryResponse<T> extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

    public static <T> UserQueryResponse<T> success(T data) {
        UserQueryResponse<T> response = new UserQueryResponse<>();
        response.setData(data);
        response.setSuccess(true);
        return response;
    }

}
