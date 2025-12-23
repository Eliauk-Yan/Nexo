package com.nexo.common.api.user.request;

import com.nexo.common.api.user.request.condition.UserQueryCondition;
import com.nexo.common.base.request.BaseRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * @classname UserQueryRequest
 * @description 用户查询请求
 * @date 2025/12/03 12:47
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class UserQueryRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private UserQueryCondition condition;

}
