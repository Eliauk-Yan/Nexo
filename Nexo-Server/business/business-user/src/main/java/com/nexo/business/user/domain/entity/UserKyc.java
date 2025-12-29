package com.nexo.business.user.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.datasource.domain.entity.BaseEntity;
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
@TableName("user_kyc")
public class UserKyc extends BaseEntity {

    /**
     * 用户 ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 真实姓名
     */
    @TableField("real_name")
    private String realName;

    /**
     * 身份证号码
     */
    @TableField("id_card_no")
    private String idCardNo;


    @TableField("id_card_front")
    private String certification;

}
