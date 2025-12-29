package com.nexo.business.user.interfaces.dto;

import lombok.Data;

/**
 * @classname UserUpdateRequest
 * @description 用户更新请求参数
 * @date 2025/12/12 10:21
 * @created by YanShijie
 */
@Data
public class UserUpdateDTO {

    private String nickName;

    private String phone;

    private String password;
}
