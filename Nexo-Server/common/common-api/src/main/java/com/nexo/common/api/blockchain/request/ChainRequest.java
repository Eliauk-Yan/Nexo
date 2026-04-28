package com.nexo.common.api.blockchain.request;

import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
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

    // 公共属性

    /**
     * 幂等号
     */
    private String identifier;

    /**
     * 业务id
     */
    private String bizId;

    /**
     * 业务类型
     */
    private ChainOperationBizType bizType;


    /**
     * 藏品序列号
     */
    private String serialNo;


    private String owner;

    /**
     * ntf唯一编号
     */
    private String ntfId;



    // 用户注册上链

    /**
     * 链上用户id
     */
    private String userId;

    /**
     * 密码
     */
    private String pwd;

    // 资产上链

    /**
     * 藏品类目ID（可选）
     */
    private String classId;

    /**
     * 藏品类目名称
     */
    private String className;

    /**
     * 创作者
     */
    private String creator;

    /**
     * 藏品分类
     */
    private String category;

    /**
     * 藏品描述
     */
    private String description;

    // 资产uri设置

    /**
     * 元数据 URI
     */
    private String uri;

    // 资产铸造

    /**
     * 接收者地址
     */
    private String to;


}
