package com.nexo.common.api.order.request;

import com.nexo.common.api.user.constant.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.time.LocalDateTime;

@Getter
@Setter
public abstract class OrderUpdateRequest extends OrderBaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 订单id
     */
    @NotNull(message = "订单ID不能为空")
    private String orderId;

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
    @NotNull(message = "操作人类型不能为空")
    private UserType operatorType;

}
