package com.nexo.business.user.interfaces.vo;


import com.github.houbb.sensitive.annotation.strategy.SensitiveStrategyEmail;
import com.github.houbb.sensitive.annotation.strategy.SensitiveStrategyMaskHalf;
import com.github.houbb.sensitive.annotation.strategy.SensitiveStrategyPhone;
import lombok.Data;

/**
 * @classname UserProfile
 * @description 用户账户信息
 * @date 2025/12/17 20:09
 * @created by YanShijie
 */
@Data
public class UserProfileVO {

    private String avatarUrl;

    private String nickName;

    @SensitiveStrategyPhone
    private String phone;

    @SensitiveStrategyMaskHalf
    private String alipay;

    @SensitiveStrategyMaskHalf
    private String wechat;

    @SensitiveStrategyEmail
    private String appleId;

    private Boolean realNameAuth;

}
