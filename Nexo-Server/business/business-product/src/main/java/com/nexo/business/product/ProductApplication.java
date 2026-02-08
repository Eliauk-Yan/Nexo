package com.nexo.business.product;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @classname ProductApplication
 * @description 商品服务启动类
 * @date 2026/02/07 01:19
 */
@SpringBootApplication
@EnableDubbo
public class ProductApplication {
    static void main() {
        SpringApplication.run(ProductApplication.class);
    }
}
