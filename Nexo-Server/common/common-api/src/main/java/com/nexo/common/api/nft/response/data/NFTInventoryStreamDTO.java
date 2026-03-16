package com.nexo.common.api.nft.response.data;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * @description 藏品流水数据
 * @date 2026/02/08 18:53
 */
@Getter
@Setter
public class NFTInventoryStreamDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long changedQuantity;

}
