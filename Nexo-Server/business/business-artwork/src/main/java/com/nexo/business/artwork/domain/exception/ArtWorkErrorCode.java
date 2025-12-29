package com.nexo.business.artwork.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ArtWorkErrorCode implements ErrorCode {

    ;

    private final String code;

    private final String message;
}
