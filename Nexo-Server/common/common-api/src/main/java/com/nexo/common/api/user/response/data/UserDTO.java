package com.nexo.common.api.user.response.data;

import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.constant.UserState;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class UserDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String nickName;
    private String phone;
    private String email;
    private UserRole role;
    private UserState state;
    private String inviteCode;
    private Long inviterId;
    private String avatarUrl;
    private LocalDateTime loginTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
