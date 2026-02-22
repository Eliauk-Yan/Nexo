package com.nexo.admin.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname NFTListDTO
 * @description 获取藏品列表条件
 * @date 2026/02/22 22:25
 */
@Getter
@Setter
public class NFTQueryDTO {

    @NotBlank(message = "页面容量不能为空")
    private Long size;

    @NotBlank(message = "当前页码不能为空")
    private Long current;

    private String name;

    private String state;

}
