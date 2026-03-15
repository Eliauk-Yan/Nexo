package com.nexo.admin.domain.param;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserQueryParam {

    private int current;

    private int size;

    private String nickName;

    private String phone;

    private String role;

    private Boolean certification;

    private String state;

}
