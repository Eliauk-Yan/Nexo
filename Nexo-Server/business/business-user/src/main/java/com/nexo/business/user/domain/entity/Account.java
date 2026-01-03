package com.nexo.business.user.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.nexo.common.datasource.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @classname UserChainAccount
 * @description 用户链账户
 * @date 2025/12/02 09:46
 * @created by YanShijie
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("accounts")
public class Account extends BaseEntity {

    /**
     * 用户 ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 链账户地址
     */
    @TableField("address")
    private String address;

    /**
     * 平台
     */
    @TableField("platform")
    private String platform;

}
