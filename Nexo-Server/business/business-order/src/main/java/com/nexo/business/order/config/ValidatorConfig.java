package com.nexo.business.order.config;

import com.nexo.business.order.domain.validator.OrderCreateValidator;
import com.nexo.business.order.domain.validator.ProductValidator;
import com.nexo.business.order.domain.validator.StockValidator;
import com.nexo.business.order.domain.validator.UserValidator;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.product.ProductFacade;
import com.nexo.common.api.user.UserFacade;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @classname ValidatorConfig
 * @description 校验器配置类
 * @date 2026/02/07 20:49
 */
@Configuration
public class ValidatorConfig {

    @DubboReference(version = "1.0.0")
    private UserFacade userFacade;

    @DubboReference(version = "1.0.0")
    private ProductFacade productFacade;

    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    @Bean
    public OrderCreateValidator getOrderCreateValidator() {
        UserValidator userValidator = new UserValidator(userFacade);
        ProductValidator productValidator = new ProductValidator(productFacade);
        StockValidator stockValidator = new StockValidator(inventoryFacade);
        productValidator.setNext(stockValidator);
        userValidator.setNext(productValidator);
        return userValidator;
    }

}
