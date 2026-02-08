package com.nexo.business.trade;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @classname TradeApplication
 * @description
 * @date 2026/02/02 23:59
 */
@SpringBootApplication
@EnableDubbo
public class TradeApplication {
    static void main() {
        SpringApplication.run(TradeApplication.class);
    }
}
