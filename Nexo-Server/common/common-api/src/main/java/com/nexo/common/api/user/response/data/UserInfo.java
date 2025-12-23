package com.nexo.common.api.user.response.data;

import com.nexo.common.api.user.constant.UserRole;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname UserInfo
 * @description 用户登录返回信息
 * @date 2025/12/03 12:58
 * @created by YanShijie
 */
@Data
public class UserInfo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String nickName;

    private String avatarUrl;

    private UserRole role;

}
