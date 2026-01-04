package com.nexo.business.chain.domain.exception;

import com.nexo.common.base.exception.code.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ChainErrorCode implements ErrorCode {

    BLOCKCHAIN_TYPE_NOT_FOUND("BLOCKCHAIN_TYPE_NOT_FOUND", "没有找到对应的区块链类型"),

    LOG_UPDATE_FAILED("LOG_UPDATE_FAILED", "链操作日志更新失败");

    private final String code;

    private final String message;
}
