package com.nexo.business.collection.interfaces.param;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DestroyParam {

    @NotNull(message = "资产ID不能为空")
    private String assetId;

}
