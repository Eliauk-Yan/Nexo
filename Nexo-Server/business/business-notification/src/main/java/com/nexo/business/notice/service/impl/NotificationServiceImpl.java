package com.nexo.business.notice.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.notice.constant.NotificationState;
import com.nexo.business.notice.constant.NotificationType;
import com.nexo.business.notice.domain.entity.Notification;
import com.nexo.business.notice.service.NotificationService;
import com.nexo.business.notice.mapper.NotificationMapper;
import org.springframework.stereotype.Service;

/**
 * @classname NotificationServiceImpl
 * @description 通知服务实现类
 * @date 2025/12/01 18:37
 * @created by YanShijie
 */
@Service
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    @Override
    public Notification saveSmsNotification(String phone, String verifyCode) {
        Notification notification = new Notification();
        notification.setTitle(NotificationType.SMS.getDesc());
        notification.setTarget(phone);
        notification.setContent(verifyCode);
        notification.setNotifyType(NotificationType.SMS);
        notification.setStatus(NotificationState.PENDING);
        this.save(notification);
        return notification;
    }
}
