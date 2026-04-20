package com.nexo.common.api.user.request;

import com.nexo.common.base.request.BaseRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * @classname UserRegisterRequest
 * @description 用户注册请求
 * @date 2025/12/02 12:52
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class UserRegisterRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private String phone;

    private String inviteCode;

}
