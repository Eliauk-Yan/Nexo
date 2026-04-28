package com.nexo.admin.domain.param;

import lombok.Getter;
import lombok.Setter;

/**
 * @classname NFTListDTO
 * @description 获取藏品列表条件
 * @date 2026/02/22 22:25
 */
@Getter
@Setter
public class NFTQueryParam {

    private int size;

    private int current;

    private String name;

    private String classify;

    private String state;

}
