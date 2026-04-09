package com.nexo.common.api.pay.response.data;

import com.nexo.common.api.pay.constant.PayState;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class PayOrderVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String payOrderId;

    private String payUrl;

    private PayState payState;
}
