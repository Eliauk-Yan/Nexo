package com.nexo.admin.domain.dto;

import lombok.Data;

@Data
public class UserQueryDTO {

    private Long current = 1L;

    private Long size = 10L;

    private String nickName;

    private String phone;

}
