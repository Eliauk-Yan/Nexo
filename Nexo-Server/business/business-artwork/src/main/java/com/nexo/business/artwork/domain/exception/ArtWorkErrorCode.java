package com.nexo.business.artwork.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ArtWorkErrorCode implements ErrorCode {

    ARTWORK_UPDATE_FAILED("ARTWORK_UPDATE_FAILED", "藏品更新失败"),

    ARTWORK_INVENTORY_STREAM_SAVE_FAILED("ARTWORK_INVENTORY_STREAM_SAVE_FAILED", "藏品库存流保存失败"),

    ARTWORK_NOT_FOUND("ARTWORK_NOT_FOUND", "藏品不存在"),;

    private final String code;

    private final String message;
}
