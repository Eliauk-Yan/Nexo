package com.nexo.admin.domain.dto;

import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.constant.UserState;
import lombok.Data;

@Data
public class UserCreateDTO {

    private String nickName;

    private String phone;

    private String email;

    private UserRole role;

    private UserState state;

    private String avatarUrl;

}
