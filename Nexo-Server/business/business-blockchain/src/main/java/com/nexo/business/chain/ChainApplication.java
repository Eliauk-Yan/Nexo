package com.nexo.business.chain;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @classname ChainApplication
 * @description 链服务启动类
 * @date 2026/01/05 17:22
 */
@EnableDubbo
@SpringBootApplication
public class ChainApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChainApplication.class, args);
    }
}
