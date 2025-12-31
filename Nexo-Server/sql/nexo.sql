create database nexo;

use nexo;

DROP TABLE IF EXISTS `notification`;

CREATE TABLE `notification`
(
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    title        varchar(512) charset utf8mb3 null comment '通知标题',
    content      text charset utf8mb3         null comment '通知内容',
    notify_type  varchar(128) charset utf8mb3 null comment '通知类型',
    target       varchar(256) charset utf8mb3 null comment '接收地址',
    state        varchar(128) charset utf8mb3 null comment '状态',
    success_time datetime                     null comment '发送成功时间',
    fail_message text charset utf8mb3         null comment '失败信息',
    created_at   DATETIME(3)                  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    updated_at   DATETIME(3)                  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    deleted      TINYINT(1)                   NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=正常，1=已删除',
    version      INT UNSIGNED                 NOT NULL DEFAULT 1 COMMENT '乐观锁版本号'
)
    COMMENT ='通知表';

DROP TABLE IF EXISTS `users`;

CREATE TABLE users
(
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    nick_name   VARCHAR(255) UNIQUE COMMENT '昵称/显示名',
    phone       VARCHAR(32)              DEFAULT NULL COMMENT '手机号（国际码）',
    email       VARCHAR(255)             DEFAULT NULL COMMENT '邮箱',
    password    VARCHAR(255)    NOT NULL COMMENT '密码哈希（bcrypt/argon2）',
    role        varchar(128)             DEFAULT NULL COMMENT '用户角色',
    state       VARCHAR(32)     NOT NULL COMMENT '用户状态',
    invite_code VARCHAR(64)              DEFAULT NULL COMMENT '邀请码（可唯一）',
    inviter_id  BIGINT UNSIGNED          DEFAULT NULL COMMENT '邀请人 user_id',
    avatar_url  VARCHAR(1024)            DEFAULT NULL COMMENT '头像 URL',
    login_time  DATETIME                 DEFAULT NULL COMMENT '最后登录时间',
    deleted     TINYINT(1)               DEFAULT 0 COMMENT '是否逻辑删除，0为未删除，非0为已删除',
    version     INT                      DEFAULT 1 COMMENT '乐观锁版本号',
    created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_invite_code` (`invite_code`),
    UNIQUE KEY `uk_phone` (`phone`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
    COMMENT ='用户主表';

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `user_kyc`
(
    `id`                BIGINT UNSIGNED                                        NOT NULL AUTO_INCREMENT,
    `user_id`           BIGINT UNSIGNED                                        NOT NULL COMMENT '关联 users.id',
    `kyc_status`        ENUM ('NOT_SUBMITTED','PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'NOT_SUBMITTED' COMMENT 'KYC 状态',
    `real_name`         VARCHAR(255)                                                    DEFAULT NULL COMMENT '真实姓名（敏感，建议加密）',
    `id_card_no`        VARCHAR(128)                                                    DEFAULT NULL COMMENT '证件号（敏感，建议加密且脱敏存储）',
    `id_card_type`      VARCHAR(32)                                                     DEFAULT 'ID_CARD' COMMENT '证件类型（ID_CARD/PASSPORT/DRIVER_LICENSE）',
    `id_card_front_url` VARCHAR(1024)                                                   DEFAULT NULL COMMENT '证件照-正面（建议存对象存储 URL）',
    `id_card_back_url`  VARCHAR(1024)                                                   DEFAULT NULL COMMENT '证件照-反面（建议存对象存储 URL）',
    `face_photo_url`    VARCHAR(1024)                                                   DEFAULT NULL COMMENT '用户拍照人像（或活体照）',
    `submit_time`       DATETIME(3)                                                     DEFAULT NULL COMMENT '提交时间',
    `review_time`       DATETIME(3)                                                     DEFAULT NULL COMMENT '审核时间',
    `reviewer`          VARCHAR(128)                                                    DEFAULT NULL COMMENT '审核人标识',
    `reject_reason`     VARCHAR(1024)                                                   DEFAULT NULL COMMENT '拒绝原因',
    `created_at`        DATETIME(3)                                            NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at`        DATETIME(3)                                            NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `deleted`           TINYINT(1)                                             NOT NULL DEFAULT 0 COMMENT '逻辑删除 0=正常 1=已删除',
    `version`           INT UNSIGNED                                           NOT NULL DEFAULT 1 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_kyc_user` (`user_id`),
    CONSTRAINT `fk_kyc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
    COMMENT ='用户 KYC 实名认证表（敏感字段请加密）';

CREATE TABLE `accounts`
(
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`      BIGINT UNSIGNED NOT NULL,
    `blockchain`   VARCHAR(64)     NOT NULL COMMENT '链名称或标识（ETH,SOL,BSC 等）',
    `address`      VARCHAR(255)    NOT NULL COMMENT '链上地址/钱包地址',
    `address_type` ENUM ('EOA','CONTRACT','MNEMONIC','OTHER') DEFAULT 'EOA' COMMENT '地址类型',
    `primary`      TINYINT(1)      NOT NULL                   DEFAULT 0 COMMENT '是否主地址',
    `verified`     TINYINT(1)      NOT NULL                   DEFAULT 0 COMMENT '是否已链上/签名校验',
    `meta`         JSON                                       DEFAULT NULL COMMENT '扩展信息（可存签名、公钥等）',
    `created_at`   DATETIME(3)     NOT NULL                   DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at`   DATETIME(3)     NOT NULL                   DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `deleted`      TINYINT(1)      NOT NULL                   DEFAULT 0 COMMENT '逻辑删除 0=正常 1=已删除',
    `version`      INT UNSIGNED    NOT NULL                   DEFAULT 1 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_blockchain_address` (`blockchain`, `address`),
    CONSTRAINT `fk_chain_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
    COMMENT ='用户链上账户/钱包地址表';


CREATE TABLE `artworks`
(
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '藏品ID',
    `name`               VARCHAR(512)                            DEFAULT NULL COMMENT '藏品名称',
    `cover`              VARCHAR(512)                            DEFAULT NULL COMMENT '藏品封面',
    `class_id`           VARCHAR(128)                            DEFAULT NULL COMMENT '藏品类目ID',
    `price`              DECIMAL(18, 6)                          DEFAULT NULL COMMENT '价格',
    `quantity`           BIGINT                                  DEFAULT NULL COMMENT '藏品数量',
    `description`        TEXT COMMENT '详情描述',
    `saleable_inventory` BIGINT                                  DEFAULT NULL COMMENT '可销售库存',
    `occupied_inventory` BIGINT                                  DEFAULT NULL COMMENT '已占用库存',
    `frozen_inventory`   BIGINT                                  DEFAULT 0 COMMENT '冻结库存',
    `identifier`         VARCHAR(128)                            DEFAULT NULL COMMENT '幂等号',
    `state`              ENUM ('pending', 'success', 'archived') DEFAULT 'pending' COMMENT '藏品状态（未处理，上链成功，已下架）',
    `sale_time`          DATETIME                                DEFAULT NULL COMMENT '藏品发售时间',
    `sync_chain_time`    DATETIME                                DEFAULT NULL COMMENT '藏品上链时间',
    `book_start_time`    DATETIME                                DEFAULT NULL COMMENT '预约开始时间',
    `book_end_time`      DATETIME                                DEFAULT NULL COMMENT '预约结束时间',
    `can_book`           INT                                     DEFAULT NULL COMMENT '是否可以预约',
    `deleted`            INT                                     DEFAULT 0 COMMENT '是否逻辑删除，0为未删除，非0为已删除',
    `creator_id`         BIGINT                                  DEFAULT NULL COMMENT '创建者',
    `version`            INT                                     DEFAULT 1 COMMENT '乐观锁版本号',
    `created_at`         TIMESTAMP                               DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    `updated_at`         TIMESTAMP                               DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='藏品表';

CREATE TABLE `assets`
(
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID（自增主键）',
    `artwork_id`         BIGINT UNSIGNED                                 DEFAULT NULL COMMENT '藏品ID（外键，关联artworks表）',
    `purchase_price`     DECIMAL(18, 6)                                  DEFAULT NULL COMMENT '购买价格',
    `serial_number`      VARCHAR(256) CHARACTER SET utf8mb4              DEFAULT NULL COMMENT '藏品序列号',
    `nft_identifier`     VARCHAR(256) CHARACTER SET utf8mb4              DEFAULT NULL COMMENT 'NFT唯一标识符',
    `previous_holder_id` BIGINT                                          DEFAULT NULL COMMENT '上一持有者ID',
    `current_holder_id`  BIGINT                                          DEFAULT NULL COMMENT '当前持有者ID',
    `state`              ENUM ('init', 'active', 'inactive', 'archived') DEFAULT 'init' COMMENT '资产状态',
    `transaction_hash`   VARCHAR(256) CHARACTER SET utf8mb4              DEFAULT NULL COMMENT '交易哈希',
    `reference_price`    DECIMAL(18, 6)  NULL COMMENT '参考价格',
    `rarity`             VARCHAR(64)     NULL COMMENT '稀有度',
    `sync_chain_time`    DATETIME                                        DEFAULT NULL COMMENT '藏品同步链时间',
    `destruction_time`   DATETIME                                        DEFAULT NULL COMMENT '藏品销毁时间',
    `deleted`            INT                                             DEFAULT 0 COMMENT '是否逻辑删除，0为未删除，非0为已删除',
    `business_no`        VARCHAR(128) CHARACTER SET utf8mb4              DEFAULT NULL COMMENT '业务单据号',
    `business_type`      VARCHAR(64) CHARACTER SET utf8mb4               DEFAULT NULL COMMENT '业务类型',
    `created_at`         TIMESTAMP                                       DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    `updated_at`         TIMESTAMP                                       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
    PRIMARY KEY (`id`),
    FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT = '资产表';

CREATE TABLE chain_operation_log
(
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    chain_type     VARCHAR(32)     NOT NULL COMMENT '链类型(代码)',
    biz_type       VARCHAR(32)     NOT NULL COMMENT '业务类型(代码)',
    biz_id         VARCHAR(128)    NOT NULL COMMENT '业务ID',
    operation_type VARCHAR(32)     NOT NULL COMMENT '操作类型(代码)',
    state          VARCHAR(32)     NOT NULL COMMENT '状态(代码)',
    operate_time   DATETIME        NOT NULL COMMENT '操作发起时间',
    succeed_time   DATETIME                 DEFAULT NULL COMMENT '成功时间',
    out_biz_id     VARCHAR(128)             DEFAULT NULL COMMENT '外部业务id',
    param          MEDIUMTEXT      NULL COMMENT '入参',
    result         MEDIUMTEXT      NULL COMMENT '返回结果',
    deleted        TINYINT(1)               DEFAULT 0 COMMENT '是否逻辑删除，0为未删除，非0为已删除',
    version        INT                      DEFAULT 1 COMMENT '乐观锁版本号',
    created_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    updated_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',

    PRIMARY KEY (id),
    KEY idx_biz (biz_type, biz_id),
    KEY idx_out_biz_id (out_biz_id),
    KEY idx_state_time (state, operate_time),
    KEY idx_deleted (deleted)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='链操作日志';
