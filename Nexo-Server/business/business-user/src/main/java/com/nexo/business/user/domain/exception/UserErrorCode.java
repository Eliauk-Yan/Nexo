package com.nexo.business.user.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname UserErrorCode
 * @description 用户模块错误码
 * @date 2025/12/02 09:11
 * @created by YanShijie
 */

@Getter
@AllArgsConstructor
public enum UserErrorCode implements ErrorCode {

    USER_STATUS_IS_NOT_FROZEN("USER_STATUS_IS_NOT_FROZEN", "用户状态非FROZEN状态"),

    USER_STATUS_IS_NOT_ACTIVE("USER_STATUS_IS_NOT_ACTIVE", "用户状态非ACTIVE状态"),

    USER_UPDATE_FAILED("USER_UPDATE_FAILED", "用户更新失败"),

    USER_CREATE_CHAIN_FAIL("USER_CREATE_CHAIN_FAIL", "创建链账户失败"),

    USER_NOT_EXIST("USER_NOT_EXIST", "用户不存在"),

    REAL_NAME_AUTH_FAILED("REAL_NAME_AUTH_FAILED", "实名认证失败"),

    REAL_NAME_AUTH_SERVICE_ERROR("REAL_NAME_AUTH_SERVICE_ERROR", "实名认证服务错误");

    private final String code;

    private final String message;
}
