package com.nexo.common.mq.config;

import com.nexo.common.mq.producer.StreamProducer;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.context.annotation.Bean;


/**
 * @classname StreamConfiguration
 * @description MQ自动配置类
 * @date 2026/02/09 03:02
 */
@AutoConfiguration
public class StreamConfiguration {

    @Bean
    public StreamProducer streamProducer(StreamBridge streamBridge) {
        return new StreamProducer(streamBridge);
    }
}
