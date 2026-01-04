package com.nexo.business.user.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.datasource.entity.BaseEntity;
import com.nexo.business.user.config.encrypt.AesEncryptTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @classname UserKYC
 * @description 用户 KYC 信息
 * @date 2025/12/02 09:44
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "certifications", autoResultMap = true)
public class Certification extends BaseEntity {

    /**
     * 用户 ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 真实姓名
     */
    @TableField(value = "real_name", typeHandler = AesEncryptTypeHandler.class)
    private String realName;

    /**
     * 身份证号码
     */
    @TableField(value = "id_card_no", typeHandler = AesEncryptTypeHandler.class)
    private String idCardNo;


    @TableField("id_card_front")
    private String certification;

}
