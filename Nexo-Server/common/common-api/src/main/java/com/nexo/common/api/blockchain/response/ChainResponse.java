package com.nexo.common.api.blockchain.response;

import com.nexo.common.base.response.BaseResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * @classname BlockchainResponse
 * @description 区块链响应
 * @date 2025/12/25 11:26
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ChainResponse<T> extends BaseResponse {

    @Serial
    private static final long serialVersionUID = 1L;

    private T data;

    /**
     * 链账户名称
     */
    private String name;

    /**
     * ntf唯一编号
     */
    private String nftId;

    /**
     * 状态
     */
    private String state;


    /**
     * 藏品编号
     */
    private String serialNo;

    /**
     * 用户链上ID
     */
    private String userId;

    /**
     * 交易哈希
     */
    private String txHash;

    /**
     * 幂等号
     */
    private String identifier;

    /**
     * 外部业务ID
     */
    private String outBizId;

    /**
     * 平台名称
     */
    private String platform;


    public static ChainResponse success(String identifier) {
        ChainResponse response = new ChainResponse();
        response.setSuccess(true);
        response.setMessage("成功");
        response.setCode("200");
        response.setIdentifier(identifier);
        return response;
    }

    public static ChainResponse failed(String msg, String code) {
        ChainResponse response = new ChainResponse();
        response.setSuccess(false);
        response.setMessage(msg);
        response.setCode(code);
        return response;
    }

    public static <T> ChainResponse<T> success(T data) {
        ChainResponse<T> response = new ChainResponse<>();
        response.setSuccess(true);
        response.setData(data);
        return response;
    }

}
