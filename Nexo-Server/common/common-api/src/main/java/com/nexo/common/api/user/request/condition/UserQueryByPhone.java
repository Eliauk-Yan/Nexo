package com.nexo.common.api.user.request.condition;


import java.io.Serial;

/**
 * @classname UserQueryByPhone
 * @description 手机号查询请求条件
 * @date 2025/12/03 12:56
 * @created by YanShijie
 */
public record UserQueryByPhone(String phone) implements UserQueryCondition {

    @Serial
    private static final long serialVersionUID = 1L;

}
