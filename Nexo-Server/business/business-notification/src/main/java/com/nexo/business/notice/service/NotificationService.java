package com.nexo.business.notice.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.notice.domain.entity.Notification;

public interface NotificationService extends IService<Notification> {

    /**
     * 保存短信通知
     * @param phone 手机号
     * @param verifyCode 验证码
     * @return 返回通知实体
     */
    Notification saveSmsNotification(String phone, String verifyCode);
}
