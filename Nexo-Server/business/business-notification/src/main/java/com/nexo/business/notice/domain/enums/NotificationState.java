package com.nexo.business.notice.domain.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @classname NotificationState
 * @description 通知状态枚举
 * @date 2025/11/28 15:45
 * @created by YanShijie
 */
@AllArgsConstructor
@Getter
public enum NotificationState {

    /**
     * 待发送
     */
    PENDING("PENDING", "待发送"),

    /**
     * 发送中
     */
    SENDING("SENDING", "发送中"),

    /**
     * 发送成功
     */
    SUCCESS("SUCCESS", "发送成功"),

    /**
     * 发送失败
     */
    FAILED("FAILED", "发送失败");

    private final String code;

    private final String desc;
}
