package com.nexo.common.api.user.request;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Setter
@Getter
public class UserListQueryRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long current = 1L;

    private Long size = 10L;

    private String nickName;

    private String phone;

}
