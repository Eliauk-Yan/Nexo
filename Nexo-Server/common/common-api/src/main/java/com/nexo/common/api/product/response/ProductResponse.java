package com.nexo.common.api.product.response;

import com.nexo.common.api.common.response.BaseResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname ProductResponse
 * @description 商品服务响应类
 * @date 2026/02/07 01:22
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ProductResponse<T> extends BaseResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
