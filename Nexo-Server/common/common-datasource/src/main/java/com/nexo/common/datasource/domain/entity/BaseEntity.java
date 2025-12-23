package com.nexo.common.datasource.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * @classname BaseEntity
 * @description 实体基类
 * @date 2025/11/28 15:47
 * @created by YanShijie
 */
@Data
public class BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableField(value = "deleted", fill = FieldFill.INSERT)
    private Integer deleted;

    @Version
    @TableField(value = "version", fill = FieldFill.INSERT)
    private Integer version;
}
