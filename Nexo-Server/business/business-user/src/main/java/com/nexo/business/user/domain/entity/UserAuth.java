package com.nexo.business.user.domain.entity;

import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import com.baomidou.mybatisplus.annotation.TableName;

@EqualsAndHashCode(callSuper = true)
@Data
@TableName("user_auths")
public class UserAuth extends BaseEntity {

    private Long userId;

    /**
     * 登录类型
     */
    private String authType;

    /**
     * 唯一标识
     */
    private String authKey;

    /**
     * 微信 unionid
     */
    private String authUnionKey;

    /**
     * 临时token
     */
    private String credential;

}
