package com.nexo.business.order;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @classname OrderApplication
 * @description 订单模块启动类
 * @date 2026/02/06 01:09
 */
@SpringBootApplication
@EnableDubbo
public class OrderApplication {
    static void main() {
        SpringApplication.run(OrderApplication.class);
    }
}
