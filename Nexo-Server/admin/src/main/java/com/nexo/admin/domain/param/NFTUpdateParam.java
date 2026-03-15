package com.nexo.admin.domain.param;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class NFTUpdateParam {

    @NotNull(message = "藏品id不能为空")
    private Long nftId;

    private Long quantity;

    private BigDecimal price;

}
