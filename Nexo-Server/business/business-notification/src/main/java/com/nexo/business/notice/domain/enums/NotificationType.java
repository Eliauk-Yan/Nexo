package com.nexo.business.notice.domain.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname NotificationType
 * @description 通知类型枚举
 * @date 2025/11/28 15:45
 * @created by YanShijie
 */
@AllArgsConstructor
@Getter
public enum NotificationType {

    /**
     * 短信验证码
     */
    SMS("SMS_VERIFY_CODE", "短信验证码"),

    /**
     * 邮件通知
     */
    EMAIL("EMAIL", "邮件通知"),

    /**
     * 系统通知
     */
    SYSTEM("SYSTEM", "系统通知");

    private final String code;

    private final String desc;
}
