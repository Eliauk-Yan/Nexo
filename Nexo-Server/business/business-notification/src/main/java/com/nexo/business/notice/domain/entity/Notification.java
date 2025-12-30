package com.nexo.business.notice.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.business.notice.domain.enums.NotificationState;
import com.nexo.business.notice.domain.enums.NotificationType;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * @classname Notification
 * @description 通知领域实体
 * @date 2025/11/28 15:45
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("notification")
public class Notification extends BaseEntity {

    /**
     * 通知标题
     */
    @TableField("title")
    private String title;

    /**
     * 通知内容
     */
    @TableField("content")
    private String content;

    /**
     * 通知类型
     */
    @TableField("notify_type")
    private NotificationType notifyType;

    /**
     * 发送成功时间
     */
    @TableField("success_time")
    private LocalDateTime successTime;

    /**
     * 目标（手机号、邮箱等）
     */
    @TableField("target")
    private String target;

    /**
     * 通知状态（数据库字段为state）
     */
    @TableField("state")
    private NotificationState status;

    /**
     * 失败信息
     */
    @TableField("fail_message")
    private String failMessage;

}
