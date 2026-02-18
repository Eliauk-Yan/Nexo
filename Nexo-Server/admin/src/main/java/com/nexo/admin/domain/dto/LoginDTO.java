package com.nexo.admin.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname LoginDTO
 * @description 登录参数
 * @date 2026/02/19 01:32
 */
@Getter
@Setter
public class LoginDTO {

    /**
     * 手机号
     */
    @NotBlank(message = "用户名不能为空")
    private String phone;

    /**
     * 密码
     */
    @NotBlank(message = "密码不能为空")
    private String password;

    /**
     * 记住密码（可选）
     */
    private Boolean rememberMe;

}
