package com.nexo.common.api.user.request.condition;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname UserQueryByPhoneAndPassword
 * @description 手机号与密码查询条件
 * @date 2026/02/19 01:57
 */
public record UserQueryByPhoneAndPassword(String phone, String password) implements UserQueryCondition, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

}
