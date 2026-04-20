package com.nexo.business.user.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.business.user.config.encrypt.AesEncryptTypeHandler;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.constant.UserState;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
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

    @Serial
    private static final long serialVersionUID = 1L;

    private String nickName;

    private String phone;

    private String email;

    private UserRole role;

    private String password;

    private UserState state;

    private String avatarUrl;

    private LocalDateTime loginTime;

    private String address;

    private String platform;

    private Boolean certification;

    @TableField(typeHandler = AesEncryptTypeHandler.class)
    private String realName;

    @TableField(typeHandler = AesEncryptTypeHandler.class)
    private String idCard;

    private String inviteCode;

    private String inviteId;

    public void register(String defaultNickName, String phone, String inviteId, String myInviteCode) {
        this.nickName = defaultNickName;
        this.phone = phone;
        this.role = UserRole.COLLECTOR;
        this.state = UserState.INIT;
        this.inviteId = inviteId;
        this.inviteCode = myInviteCode;
    }
}
