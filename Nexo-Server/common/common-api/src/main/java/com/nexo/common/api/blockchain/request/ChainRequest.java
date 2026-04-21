package com.nexo.common.api.blockchain.request;

import com.nexo.common.base.request.BaseRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * @classname BlockchainRequest
 * @description 区块链请求
 * @date 2025/12/25 16:49
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ChainRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 幂等号
     */
    private String identifier;

    /**
     * 藏品类别ID(藏品ID)
     */
    private String classId;

    /**
     * 藏品类别名称
     */
    private String className;

    /**
     * 藏品序列号
     */
    private String serialNo;

    /**
     * 接收者地址
     */
    private String recipient;

    /**
     * 持有者地址
     */
    private String owner;

    /**
     * ntf唯一编号
     */
    private String ntfId;

    /**
     * 用户id
     */
    private String userId;

    /**
     * 业务id
     */
    private String bizId;

    /**
     * 业务类型
     */
    private String bizType;

}
