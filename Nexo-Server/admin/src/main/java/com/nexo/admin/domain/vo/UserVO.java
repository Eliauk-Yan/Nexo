package com.nexo.admin.domain.vo;

import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.constant.UserState;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserVO {
    private Long id;
    private String nickName;
    private String phone;
    private String email;
    private UserRole role;
    private UserState state;
    private String avatarUrl;
    private LocalDateTime loginTime;
    private LocalDateTime createdAt;
}
