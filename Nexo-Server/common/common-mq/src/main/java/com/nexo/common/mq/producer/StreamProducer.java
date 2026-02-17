package com.nexo.common.mq.producer;

import com.alibaba.fastjson.JSON;
import com.nexo.common.mq.message.MessageBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.common.message.MessageConst;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.messaging.support.MessageBuilder;

import java.util.UUID;

/**
 * @classname StreamProducer
 * @description 基于 Spring Cloud Stream 的通用消息发送封装
 * @date 2026/02/09 02:42
 */
@Slf4j
@RequiredArgsConstructor
public class StreamProducer {

    /**
     * 延迟级别常量：1分钟
     */
    public static final int DELAY_LEVEL_1_M = 5;

    /**
     * 延迟级别常量：30秒
     */
    public static final int DELAY_LEVEL_30_S = 4;

    /**
     * RocketMQ 自定义消息 ID 的 Header Key
     */
    public static final String ROCKET_MQ_MESSAGE_ID = "ROCKET_MQ_MESSAGE_ID";

    /**
     * RocketMQ 标签的 Header Key
     */
    public static final String ROCKET_TAGS = "ROCKET_TAGS";

    /**
     * RocketMQ 主题的 Header Key
     */
    public static final String ROCKET_MQ_TOPIC = "ROCKET_MQ_TOPIC";

    /**
     * Spring Cloud Stream 提供的桥接器，用于在函数式模型外手动发送消息
     */
    private final StreamBridge streamBridge;

    /**
     * 发送普通消息
     *
     * @param bindingName 输出绑定名
     * @param tag         消息标签，用于消费者过滤
     * @param msg         消息正文内容
     * @return 是否发送成功
     */
    public boolean send(String bindingName, String tag, String msg) {
        // 1. 封装统一的消息体，并生成 UUID 作为链路追踪或幂等标识
        MessageBody message = new MessageBody()
                .setIdentifier(UUID.randomUUID().toString())
                .setBody(msg);
        log.info("准备发送消息 -> 绑定名: {}, 标签: {}, 内容: {}", bindingName, tag, JSON.toJSONString(message));
        // 2. 通过 MessageBuilder 构建 Spring Messaging 消息对象，注入 TAGS 头部
        boolean result = streamBridge.send(bindingName,
                MessageBuilder.withPayload(message)
                        .setHeader(ROCKET_TAGS, tag) // 推荐使用常量映射
                        .setHeader("TAGS", tag)      // 兼容某些 Binder 的默认写法
                        .build());
        log.info("消息发送结束 -> 绑定名: {}, 结果: {}", bindingName, result);
        return result;
    }

    /**
     * 发送延迟消息
     *
     * @param bindingName 绑定名
     * @param tag         标签
     * @param msg         消息正文
     * @param delayLevel  延迟级别 (1s-2h, 共18级)
     * @return 是否发送成功
     */
    public boolean send(String bindingName, String tag, String msg, int delayLevel) {
        // 1. 封装统一的消息体，并生成 UUID 作为链路追踪或幂等标识
        MessageBody message = new MessageBody()
                .setIdentifier(UUID.randomUUID().toString())
                .setBody(msg);
        log.info("准备发送延迟消息 -> 绑定名: {}, 延迟级别: {}, 内容: {}", bindingName, delayLevel, JSON.toJSONString(message));
        // 2. 重点：注入 RocketMQ 特有的延迟级别 Header
        boolean result = streamBridge.send(bindingName,
                MessageBuilder.withPayload(message)
                        .setHeader("TAGS", tag)
                        .setHeader(MessageConst.PROPERTY_DELAY_TIME_LEVEL, delayLevel)
                        .build());
        log.info("延迟消息发送结束 -> 绑定名: {}, 结果: {}", bindingName, result);
        return result;
    }

    /**
     * 发送带自定义 Header 的消息
     *
     * @param bindingName 绑定名
     * @param tag         标签
     * @param msg         消息正文
     * @param headerKey   自定义 Header 键
     * @param headerValue 自定义 Header 值
     * @return 是否发送成功
     */
    public boolean send(String bindingName, String tag, String msg, String headerKey, String headerValue) {
        // 1. 封装消息
        MessageBody message = new MessageBody()
                .setIdentifier(UUID.randomUUID().toString())
                .setBody(msg);
        log.info("准备发送自定义消息 -> 绑定名: {}, Header: [{}={}]", bindingName, headerKey, headerValue);
        // 2. 发送消息
        boolean result = streamBridge.send(bindingName,
                MessageBuilder.withPayload(message)
                        .setHeader("TAGS", tag)
                        .setHeader(headerKey, headerValue)
                        .build());
        log.info("自定义消息发送结束 -> 绑定名: {}, 结果: {}", bindingName, result);
        return result;
    }

}