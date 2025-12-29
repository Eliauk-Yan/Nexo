package com.nexo.business.notice.interfaces.facade;

import cn.hutool.core.util.RandomUtil;
import com.nexo.business.notice.domain.enums.NotificationState;
import com.nexo.business.notice.domain.entity.Notification;
import com.nexo.business.notice.service.NotificationService;
import com.nexo.common.api.notification.NotificationFacade;
import com.nexo.common.api.notification.response.NotificationResponse;
import com.nexo.common.sms.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;


import static com.nexo.common.api.notification.constant.NotificationConstant.CAPTCHA_KEY_PREFIX;

/**
 * @classname NotificationFacadeImpl
 * @description 通知模块对外接口实现（接口层）
 * @date 2025/11/28 17:34
 * @created by YanShijie
 */
@Slf4j
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class NotificationFacadeImpl implements NotificationFacade {

    private final StringRedisTemplate stringRedisTemplate;

    private final NotificationService notificationService;

    private final SmsService smsService;

    @Transactional
    @Override
    public NotificationResponse sendSmsVerifyCode(String phone) {
        // 2. 生成验证码
        String verifyCode = RandomUtil.randomNumbers(6);
        // 3. 放入redis
        stringRedisTemplate.opsForValue().set(CAPTCHA_KEY_PREFIX + phone, verifyCode, Duration.ofMinutes(5));
        // 4. 保存通知信息
        Notification notification = notificationService.saveSmsNotification(phone, verifyCode);
        // TODO 暂时测试
        if (!phone.equals("15114785913")) {
            // 5. 异步发送信息
            smsService.sendSmsVerifyCode(notification.getTarget(), notification.getContent())
                    .whenCompleteAsync((response, throwable) -> {
                        if (throwable != null) {
                            // 5.1 有异常发送失败
                            log.error("短信发送异常: {}", throwable.getMessage(), throwable);
                            notification.setStatus(NotificationState.FAILED);
                            notificationService.updateById(notification);
                        } else if (response != null && response.getBody().getSuccess()) {
                            // 5.2 发送成功
                            log.info("短信发送成功，手机号: {}", notification.getTarget());
                            notification.setStatus(NotificationState.SUCCESS);
                            notification.setSuccessTime(LocalDateTime.now());
                            notificationService.updateById(notification);
                        } else {
                            // 5.3 无异常但响应失败 频繁发送... 没有额度...
                            String errorMsg = (response != null) ? response.getBody().getMessage() : "未知错误";
                            log.error("短信发送失败: {}", errorMsg);
                            notification.setStatus(NotificationState.FAILED);
                            notification.setFailMessage(errorMsg);
                            notificationService.updateById(notification);
                        }
                    });
        }
        // 6. 返回结果
        NotificationResponse response = new NotificationResponse();
        response.setSuccess(true);
        return response;
    }
}
