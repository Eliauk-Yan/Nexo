package com.nexo.common.api.product.response.data;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;


/**
 * @classname ProductStreamDTO
 * @description 商品流水数据
 * @date 2026/02/08 17:18
 */
@Getter
@Setter
public abstract class ProductInventoryStreamDTO implements Serializable {

    // fix 2月6日修改Dubbo序列化问题 所有Facade接口出入参都需要序列化
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * '变更数量'
     */
    private Long changedQuantity;


}
