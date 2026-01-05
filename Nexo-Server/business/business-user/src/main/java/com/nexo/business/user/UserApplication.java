package com.nexo.business.user;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @classname UserApplication
 * @description 用户模块启动类
 * @date 2025/11/28 14:01
 * @created by YanShijie
 */
@EnableDubbo
@SpringBootApplication
public class UserApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
}
