package com.nexo.business.trade.interfaces.vo;


import com.nexo.common.api.pay.constant.PayState;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class PayVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String payOrderId;

    private PayState payState;

}
