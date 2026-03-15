package com.nexo.common.api.user.request;

import com.nexo.common.base.request.PageRequest;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Setter
@Getter
public class UserPageQueryRequest extends PageRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private String state;

    private String keyword;

    private String nickName;

    private String role;

    private Boolean certification;

}
