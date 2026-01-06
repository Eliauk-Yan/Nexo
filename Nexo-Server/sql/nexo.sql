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


create table certifications
(
    id            bigint unsigned auto_increment comment '主键ID'
        primary key,
    user_id       bigint unsigned                          not null comment '用户ID',
    certification varchar(32)                              null comment '认证状态',
    real_name     varchar(64)                              null comment '真实姓名',
    id_card_no    varchar(64)                              null comment '身份证号',
    deleted       tinyint(1)  default 0                    null comment '是否逻辑删除，0为未删除，非0为已删除',
    version       int         default 1                    null comment '乐观锁版本号',
    created_at    datetime(3) default CURRENT_TIMESTAMP(3) not null comment '创建时间',
    updated_at    datetime(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3) comment '更新时间',
    constraint uk_user_id
        unique (user_id),
    constraint fk_user_kyc_id
        foreign key (user_id) references users (id)
)
    comment '用户实名信息(敏感)';

create index idx_user_id
    on certifications (user_id);

create table accounts
(
    id         bigint unsigned auto_increment comment '主键ID'
        primary key,
    user_id    bigint unsigned                          not null comment '用户ID',
    address    varchar(1024)                            null comment '链地址/区块链URL',
    platform   varchar(32)                              null comment '链平台',
    deleted    tinyint(1)  default 0                    null comment '是否逻辑删除，0为未删除，非0为已删除',
    version    int         default 1                    null comment '乐观锁版本号',
    created_at datetime(3) default CURRENT_TIMESTAMP(3) not null comment '创建时间',
    updated_at datetime(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3) comment '更新时间',
    constraint uk_user_id
        unique (user_id),
    constraint fk_user_wallet_id
        foreign key (user_id) references users (id)
)
    comment '用户链账户';

create index idx_user_id
    on accounts (user_id);


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
    biz_id         VARCHAR(128) COMMENT '业务ID',
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

CREATE TABLE `trade_order`
(
    id                BIGINT UNSIGNED                   NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    order_id          varchar(32) CHARACTER SET utf8mb4 NOT NULL COMMENT '订单号',
    buyer_id          varchar(32)                       NOT NULL COMMENT '买家ID',
    buyer_type        varchar(32)                       NOT NULL COMMENT '买家类型',
    seller_id         varchar(32)                       NOT NULL COMMENT '卖家ID',
    seller_type       varchar(32)                       NOT NULL COMMENT '卖家类型',
    request_id        varchar(128)                      NOT NULL COMMENT '幂等号',
    product_id        varchar(32)                       NOT NULL COMMENT '商品ID',
    product_type      varchar(32)                       NOT NULL COMMENT '商品类型',
    product_cover_url varchar(512)                               DEFAULT NULL COMMENT '商品图片地址',
    product_name      varchar(1024)                              DEFAULT NULL COMMENT '商品名称',
    unit_price        decimal(18, 6)                             DEFAULT NULL COMMENT '商品单价',
    item_quantity     int                               NOT NULL COMMENT '商品数量',
    order_amount      decimal(18, 6)                    NOT NULL COMMENT '订单金额',
    order_state       varchar(32)                       NOT NULL COMMENT '订单状态',
    paid_amount       decimal(18, 6)                    NOT NULL COMMENT '已支付金额',
    paid_time         datetime                                   DEFAULT NULL COMMENT '支付成功时间',
    confirmed_time    datetime                                   DEFAULT NULL COMMENT '订单确认时间',
    finished_time     datetime                                   DEFAULT NULL COMMENT '完结时间',
    closed_time       datetime                                   DEFAULT NULL COMMENT '关单时间',
    pay_method        varchar(64) CHARACTER SET utf8mb4          DEFAULT NULL COMMENT '支付方式',
    pay_stream_id     varchar(256)                               DEFAULT NULL COMMENT '支付流水号',
    close_type        varchar(32)                                DEFAULT NULL COMMENT '关闭类型',
    snapshot_version  int                                        DEFAULT NULL COMMENT '商品快照版本号',
    deleted           TINYINT(1)                                 DEFAULT 0 COMMENT '是否逻辑删除，0为未删除，非0为已删除',
    version           INT                                        DEFAULT 1 COMMENT '乐观锁版本号',
    created_at        DATETIME(3)                       NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    updated_at        DATETIME(3)                       NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_id (order_id),
    UNIQUE KEY uk_request_id (request_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='交易订单'
;

CREATE TABLE `trade_order_stream`
(
    id                BIGINT UNSIGNED                   NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    order_id          varchar(32) CHARACTER SET utf8mb4 NOT NULL COMMENT '订单号',
    buyer_id          varchar(32)                       NOT NULL COMMENT '买家ID',
    buyer_type        varchar(32)                       NOT NULL COMMENT '买家类型',
    seller_id         varchar(32)                       NOT NULL COMMENT '卖家ID',
    seller_type       varchar(32)                       NOT NULL COMMENT '卖家类型',
    request_id        varchar(128)                      NOT NULL COMMENT '幂等号',
    product_id        varchar(32)                       NOT NULL COMMENT '商品ID',
    product_type      varchar(32)                       NOT NULL COMMENT '商品类型',
    product_cover_url varchar(512)                               DEFAULT NULL COMMENT '商品图片地址',
    product_name      varchar(1024)                              DEFAULT NULL COMMENT '商品名称',
    unit_price        decimal(18, 6)                             DEFAULT NULL COMMENT '商品单价',
    item_quantity     int                               NOT NULL COMMENT '商品数量',
    order_amount      decimal(18, 6)                    NOT NULL COMMENT '订单金额',
    order_state       varchar(32)                       NOT NULL COMMENT '订单状态',
    paid_amount       decimal(18, 6)                    NOT NULL COMMENT '已支付金额',
    paid_time         datetime                                   DEFAULT NULL COMMENT '支付成功时间',
    confirmed_time    datetime                                   DEFAULT NULL COMMENT '订单确认时间',
    finished_time     datetime                                   DEFAULT NULL COMMENT '完结时间',
    closed_time       datetime                                   DEFAULT NULL COMMENT '关单时间',
    pay_method        varchar(64) CHARACTER SET utf8mb4          DEFAULT NULL COMMENT '支付方式',
    pay_stream_id     varchar(256)                               DEFAULT NULL COMMENT '支付流水号',
    close_type        varchar(32)                                DEFAULT NULL COMMENT '关闭类型',
    snapshot_version  int                                        DEFAULT NULL COMMENT '商品快照版本号',
    stream_id         varchar(128)                      NOT NULL COMMENT '幂等号',
    stream_type       varchar(128)                      NOT NULL COMMENT '流水类型',
    deleted           TINYINT(1)                                 DEFAULT 0 COMMENT '是否逻辑删除，0为未删除，非0为已删除',
    version           INT                                        DEFAULT 1 COMMENT '乐观锁版本号',
    created_at        DATETIME(3)                       NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    updated_at        DATETIME(3)                       NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
;
