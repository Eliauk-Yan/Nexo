package com.nexo.business.user.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.constant.UserState;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * @classname User
 * @description 用户实体类
 * @date 2025/12/02 09:08
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("users")
public class User extends BaseEntity {

    @TableField("nick_name")
    private String nickName;

    @TableField("phone")
    private String phone;

    @TableField("email")
    private String email;

    @TableField("role")
    private UserRole role;

    @TableField("password")
    private String password;

    @TableField("state")
    private UserState state;

    @TableField("invite_code")
    private String inviteCode;

    @TableField("inviter_id")
    private Long inviterId;

    @TableField("avatar_url")
    private String avatarUrl;

    @TableField("login_time")
    private LocalDateTime loginTime;

}
