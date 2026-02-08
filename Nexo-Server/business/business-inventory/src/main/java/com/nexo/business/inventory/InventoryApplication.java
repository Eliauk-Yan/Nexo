package com.nexo.business.inventory;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @classname InventoryApplication
 * @description 库存模块启动类
 * @date 2026/02/08 00:15
 */
@SpringBootApplication
@EnableDubbo
public class InventoryApplication {
    static void main() {
        SpringApplication.run(InventoryApplication.class);
    }
}
