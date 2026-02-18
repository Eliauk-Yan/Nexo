package com.nexo.admin.domain.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @classname NFTCreateDTO
 * @description 数字藏品创建参数
 * @date 2026/02/19 04:26
 */
@Getter
@Setter
public class NFTCreateDTO {

    @NotNull(message = "藏品名称不能为空")
    private String name;

    @NotNull(message = "藏品封面不能为空")
    private String cover;

    private String description;

    @NotNull(message = "藏品价格不能为空")
    private BigDecimal price;

    @Min(value = 1, message = "藏品数量不能小于1")
    private Long quantity;

    @NotNull(message = "藏品发售时间不能为空")
    private LocalDateTime saleTime;

    @NotNull(message = "藏品是否预约不能为空")
    private Boolean canBook;

    private String bookStartTime;

    private String bookEndTime;

}
