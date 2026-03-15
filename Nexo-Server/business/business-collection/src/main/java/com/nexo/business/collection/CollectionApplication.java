package com.nexo.business.collection;

import com.alicp.jetcache.anno.config.EnableMethodCache;
import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableDubbo
@EnableMethodCache(basePackages = "com.nexo.business.collection")
@SpringBootApplication
public class CollectionApplication {
    static void main(String[] args) {
        SpringApplication.run(CollectionApplication.class, args);
    }
}
