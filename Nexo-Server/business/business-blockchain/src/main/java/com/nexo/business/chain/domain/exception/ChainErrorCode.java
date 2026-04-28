package com.nexo.business.chain.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
public enum ChainErrorCode implements ErrorCode {

    BLOCKCHAIN_TYPE_NOT_FOUND("BLOCKCHAIN_TYPE_NOT_FOUND", "没有找到对应的区块链类型"),

    STREAM_UPDATE_FAILED("STREAM_UPDATE_FAILED", "链操作流水更新失败"),

    STREAM_INSERT_FAILED("STREAM_INSERT_FAILED", "链操作流水插入失败"),

    STREAM_NOT_FOUND("STREAM_NOT_FOUND", "链操作流水没有发现");

    private final String code;

    private final String message;

    ChainErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
