package com.nexo.business.product.artwork.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ArtWorkErrorCode implements ErrorCode {

    ARTWORK_NOT_FOUND("ARTWORK_NOT_FOUND", "藏品不存在"),;

    private final String code;

    private final String message;
}
