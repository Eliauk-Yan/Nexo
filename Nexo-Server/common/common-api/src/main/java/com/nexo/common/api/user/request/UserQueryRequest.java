package com.nexo.common.api.user.request;

import com.nexo.common.base.request.BaseRequest;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

/**
 * @classname UserQueryRequest
 * @description 用户查询请求
 * @date 2025/12/03 12:47
 * @created by YanShijie
 */
@Getter
@Setter
public class UserQueryRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String phone;

}
