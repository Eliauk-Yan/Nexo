package com.nexo.business.user.interfaces.dto;

import lombok.Data;

/**
 * @classname realNameAuthDTO
 * @description 实名认证请求参数
 * @date 2025/12/29 20:19
 */
@Data
public class RealNameAuthDTO {

    private String realName;

    private String idCardNo;

}
