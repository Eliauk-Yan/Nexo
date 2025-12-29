package com.nexo.business.user.interfaces.vo;

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

    private String phone;

    private String alipay;

    private String wechat;

    private String appleId;

    private Boolean realNameAuth;

    private String password;

}
