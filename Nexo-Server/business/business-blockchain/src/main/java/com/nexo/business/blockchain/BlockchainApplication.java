package com.nexo.business.blockchain;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @classname BlockchainApplication
 * @description 区块链服务启动类
 * @date 2025/12/29 15:57
 */
@EnableDubbo
@SpringBootApplication
public class BlockchainApplication {
    static void main() {
        SpringApplication.run(BlockchainApplication.class);
    }
}
