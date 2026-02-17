package com.nexo.common.api.order.request;

import com.nexo.common.api.order.constant.TradeOrderEvent;
import com.nexo.common.api.user.constant.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * @classname OrderCreateAndConfirmRequest
 * @description 订单创建并提交请求
 * @date 2026/02/15 01:01
 */
@Getter
@Setter
public class OrderCreateAndConfirmRequest extends OrderCreateRequest {

    /**
     * 操作时间
     */
    @NotNull(message = "操作时间不能为空")
    private LocalDateTime operateTime;

    /**
     * 操作人
     */
    @NotNull(message = "操作人不能为空")
    private String operator;

    /**
     * 操作人类型
     */
    @NotNull(message = "操作类型不能为空")
    private UserType operatorType;


    @Override
    public TradeOrderEvent getOrderEvent() {
        return TradeOrderEvent.CREATE_AND_CONFIRM;
    }

}
