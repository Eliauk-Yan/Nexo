package com.nexo.common.base.request;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Getter
@Setter
public class PageRequest extends BaseRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private int current;

    private int size;

}
