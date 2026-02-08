package com.nexo.common.mq.message;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 消息
 *
 * @author hollis
 */
@Data
@Accessors(chain = true)
public class Message {
    /**
     * 消息id
     */
    private String msgId;

    /**
     * 消息体
     */
    private String body;
}