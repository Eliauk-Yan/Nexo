package com.nexo.common.mq.message;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 消息体
 *
 * @author hollis
 */
@Data
@Accessors(chain = true)
public class MessageBody {

    /**
     * 幂等号
     */
    private String identifier;
    /**
     * 消息体
     */
    private String body;

}