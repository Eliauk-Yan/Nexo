package com.nexo.business.artwork;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableDubbo
@SpringBootApplication
public class ArtWorkApplication {
    static void main(String[] args) {
        SpringApplication.run(ArtWorkApplication.class, args);
    }
}
