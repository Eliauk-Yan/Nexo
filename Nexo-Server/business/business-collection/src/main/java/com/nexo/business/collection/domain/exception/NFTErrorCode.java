package com.nexo.business.collection.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum NFTErrorCode implements ErrorCode {

    NFT_INVENTORY_UPDATE_FAILED("NFT_INVENTORY_UPDATE_FAILED", "藏品库存更新失败"),

    NFT_INSERT_STREAM_FAILED("NFT_INSERT_STREAM_FAILED", "藏品操作流水插入失败"),

    NFT_ON_CHAIN_FAILED("NFT_ON_CHAIN_FAILED", "藏品上链失败"),

    NFT_QUERY_FAILED("NFT_QUERY_FAILED", "藏品查询失败"),

    NFT_UPDATE_FAILED("NFT_UPDATE_FAILED", "藏品更新失败"),

    NFT_CREATE_FAILED("NFT_CREATE_FAILED", "藏品创建失败"),

    NFT_INVENTORY_INIT_FAILED("NFT_INVENTORY_INIT_FAILED", "藏品库存初始化失败"),

    NFT_INVENTORY_STREAM_SAVE_FAILED("NFT_INVENTORY_STREAM_SAVE_FAILED", "藏品库存流保存失败"),

    NFT_NOT_FOUND("NFT_NOT_FOUND", "藏品不存在"),

    ASSET_CHECK_ERROR("ASSET_CHECK_ERROR", "资产检查错误"),

    ASSET_UPDATE_FAILED("ASSET_UPDATE_FAILED", "资产更新失败"),

    ASSET_QUERY_FAILED("ASSET_QUERY_FAILED", "资产查询失败"),

    ASSET_STREAM_SAVE_FAILED("ASSET_STREAM_SAVE_FAILED", "资产流水保存失败");

    private final String code;

    private final String message;
}
