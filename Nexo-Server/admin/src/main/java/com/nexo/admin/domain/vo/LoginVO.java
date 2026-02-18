package com.nexo.admin.domain.vo;

import com.nexo.common.api.user.response.data.UserInfo;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname LoginVO
 * @description 后端管理登录VO
 * @date 2026/02/19 01:28
 */
@Getter
@Setter
public class LoginVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户标识，如用户ID
     */
    private Long userId;
    /**
     * 访问令牌
     */
    private String token;

    /**
     * 令牌过期时间
     */
    private Long tokenExpiration;

    /**
     * 用户信息
     */
    private UserInfo userInfo;
}
