package com.nexo.common.mq.consumer;

import com.alibaba.fastjson2.JSON;
import com.nexo.common.mq.message.MessageBody;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;


import static com.nexo.common.mq.producer.StreamProducer.*;

/**
 * @classname StreamConsumer
 * @description MQ消费基类 统一处理消息的反序列化、元数据提取以及日志记录。
 * @date 2026/02/09 03:00
 */
@Slf4j
public class StreamConsumer {

    /**
     * 从 Spring Messaging 的 Message 对象中解析出真正的业务对象
     *
     * @param msg  Spring Cloud Stream 接收到的原始消息对象
     * @param type 目标逻辑对象的类型（Class）
     * @param <T>  泛型标识
     * @return     转换后的业务实体对象
     */
    public static <T> T getMessage(Message<MessageBody> msg, Class<T> type) {
        // 1. 从消息头（Headers）中提取元数据
        // 获取 RocketMQ 消息 ID（用于排查问题）
        String messageId = msg.getHeaders().get(ROCKET_MQ_MESSAGE_ID, String.class);
        // 获取消息标签（用于业务过滤判断）
        String tag = msg.getHeaders().get(ROCKET_TAGS, String.class);
        // 获取消息来源的主题
        String topic = msg.getHeaders().get(ROCKET_MQ_TOPIC, String.class);

        // 2. 从消息载体（Payload）中获取 Body 字符串，并反序列化为对象
        // 注意：msg.getPayload() 得到的是 MessageBody 对象
        String rawBody = msg.getPayload().getBody();
        T object = JSON.parseObject(rawBody, type);

        // 3. 打印统一的消费日志，方便定位线上问题
        // 日志包含：Topic、MessageId、解析后的对象内容、Tag
        log.info("收到 MQ 消息 -> Topic: {}, MsgId: {}, Tag: {}, 业务对象: {}",
                topic, messageId, tag, JSON.toJSONString(object));

        return object;
    }
}