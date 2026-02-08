package com.nexo.common.api.blockchain.request;

import com.nexo.common.api.common.request.BaseRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname BlockchainRequest
 * @description 区块链请求
 * @date 2025/12/25 16:49
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ChainRequest extends BaseRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 幂等号
     */
    private String identifier;

    /**
     * 藏品类别 ID
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
     * ntf 唯一id
     */
    private String ntfId;

    /**
     * 用户 id
     */
    private String userId;

    /**
     * 业务 id
     */
    private String bizId;

}
