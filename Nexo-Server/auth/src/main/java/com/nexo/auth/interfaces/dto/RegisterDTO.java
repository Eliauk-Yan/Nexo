package com.nexo.auth.interfaces.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @classname RegisterRequest
 * @description 注册请求
 * @date 2025/12/01 20:58
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class RegisterDTO extends LoginDTO {

    private String inviteCode;
}
