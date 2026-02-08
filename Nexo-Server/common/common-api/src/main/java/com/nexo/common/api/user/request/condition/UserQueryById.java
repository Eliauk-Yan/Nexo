package com.nexo.common.api.user.request.condition;

import java.io.Serial;
import java.io.Serializable;


/**
 * @classname UserQueryById
 * @description 根据ID查询
 * @date 2026/02/07 23:50
 */
public record UserQueryById(Long id) implements UserQueryCondition, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;
}
