package com.nexo.common.api.artwork.response;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname ArtWorkResponse
 * @description 藏品响应类
 * @date 2026/01/09 10:30
 */
@Data
public class ArtWorkResponse<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

}
