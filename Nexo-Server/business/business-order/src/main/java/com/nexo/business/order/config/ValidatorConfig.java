package com.nexo.business.order.config;

import com.nexo.business.order.domain.validator.OrderCreateValidator;
import com.nexo.business.order.domain.validator.ProductValidator;
import com.nexo.business.order.domain.validator.StockValidator;
import com.nexo.business.order.domain.validator.UserValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.context.annotation.Bean;

/**
 * @classname ValidatorConfig
 * @description 校验器配置类
 * @date 2026/02/07 20:49
 */
@Configurable
@RequiredArgsConstructor
public class ValidatorConfig {

    private final UserValidator userValidator;

    private final ProductValidator productValidator;

    private final StockValidator stockValidator;

    @Bean
    public OrderCreateValidator getOrderCreateValidator() {
        productValidator.setNext(stockValidator);
        userValidator.setNext(productValidator);
        return userValidator;
    }

}
