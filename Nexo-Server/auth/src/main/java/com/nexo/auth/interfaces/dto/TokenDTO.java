package com.nexo.auth.interfaces.dto;

import lombok.Data;

/**
 * @classname TokenDTO
 * @description 获取 token 参数
 * @date 2026/01/08 23:10
 */
@Data
public class TokenDTO {

    private String scene;

    private Long key;

}
