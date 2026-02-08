package com.nexo.common.api.inventory.response;

import com.nexo.common.api.common.response.BaseResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname InventoryResponse
 * @description 库存Dubbo响应
 * @date 2026/02/08 01:26
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class InventoryResponse<T> extends BaseResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
