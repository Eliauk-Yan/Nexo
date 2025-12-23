package com.nexo.common.api.user.response;

import com.nexo.common.base.response.BaseResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * @classname UserQueryResponse
 * @description 用户查询响应类
 * @date 2025/12/03 12:46
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class UserQueryResponse<T> extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
