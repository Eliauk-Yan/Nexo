package com.nexo.common.api.blockchain.model;

import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.constant.ChainType;
import com.nexo.common.api.blockchain.response.data.ChainResultData;
import lombok.Getter;
import lombok.Setter;

/**
 * @classname ChainOperateBody
 * @description 链操作RocketMQ消息体
 * @date 2026/02/24 20:32
 */
@Getter
@Setter
public class ChainOperateBody {

    /**
     * 业务id
     */
    private String bizId;
    /**
     * 业务类型
     */
    private ChainOperationBizType bizType;

    /**
     * 操作类型
     */
    private ChainOperateType operateType;
    /**
     * 操作信息id
     */
    private Long operateInfoId;

    /**
     * 链类型
     */
    private ChainType chainType;

    /**
     * 具体业务数据
     */
    private ChainResultData chainResultData;

}
