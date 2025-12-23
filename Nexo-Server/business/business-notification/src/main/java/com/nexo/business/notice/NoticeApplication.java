package com.nexo.business.notice;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @classname NoticeApplication
 * @description 通知服务启动类
 * @date 2025/11/29 19:22
 * @created by YanShijie
 */
@EnableDubbo
@SpringBootApplication
public class NoticeApplication {
    public static void main(String[] args) {
        SpringApplication.run(NoticeApplication.class, args);
    }
}
