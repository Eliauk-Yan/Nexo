package com.nexo.business.artwork.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ArtWorkErrorCode implements ErrorCode {

    NFT_ON_CHAIN_FAILED("NFT_ON_CHAIN_FAILED", "藏品上链失败"),

    NFT_QUERY_FAILED("NFT_QUERY_FAILED", "藏品查询失败"),

    NFT_UPDATE_FAILED("NFT_UPDATE_FAILED", "藏品更新失败"),

    NFT_CREATE_FAILED("NFT_CREATE_FAILED", "藏品创建失败"),

    NFT_INVENTORY_INIT_FAILED("NFT_INVENTORY_INIT_FAILED", "藏品库存初始化失败"),

    ARTWORK_INVENTORY_STREAM_SAVE_FAILED("ARTWORK_INVENTORY_STREAM_SAVE_FAILED", "藏品库存流保存失败"),

    ARTWORK_NOT_FOUND("ARTWORK_NOT_FOUND", "藏品不存在"),;

    private final String code;

    private final String message;
}
