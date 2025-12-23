package com.nexo.business.user.domain.dto.response;

import lombok.Data;

/**
 * @classname UserProfile
 * @description 用户账户信息
 * @date 2025/12/17 20:09
 * @created by YanShijie
 */
@Data
public class UserProfile {

    private String avatarUrl;

    private String nickName;

    private String phone;

    private String alipay;

    private String wechat;

    private String appleId;

    private Boolean isVerified;

    private String password;

}
