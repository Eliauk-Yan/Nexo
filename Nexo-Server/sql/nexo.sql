create table users
(
    id            bigint unsigned auto_increment comment '主键ID' primary key,
    nick_name     varchar(255)                             null comment '昵称/显示名',
    phone         varchar(32)                              null comment '手机号（国际码）',
    email         varchar(255)                             null comment '邮箱',
    password      varchar(255)                             null comment '密码哈希（bcrypt/argon2）',
    role          varchar(128)                             null comment '用户角色',
    state         varchar(32)                              not null comment '用户状态',
    avatar_url    varchar(1024)                            null comment '头像 URL',
    login_time    datetime                                 null comment '最后登录时间',
    address       varchar(255)                             null comment '区块链地址',
    platform      varchar(255)                             null comment '区块链平台',
    certification tinyint(1)  default 0                    null comment '是否实名认证',
    real_name     varchar(64)                              null comment '真实姓名',
    id_card       varchar(128)                             null comment '身份证号',
    deleted       tinyint(1)  default 0                    null comment '是否逻辑删除，0为未删除，非0为已删除',
    version       int         default 1                    null comment '乐观锁版本号',
    created_at    datetime(3) default CURRENT_TIMESTAMP(3) not null comment '创建时间',
    updated_at    datetime(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3) comment '更新时间',
    constraint nick_name
        unique (nick_name),
    constraint uk_email
        unique (email),
    constraint uk_phone
        unique (phone)
)
    comment '用户主表' collate = utf8mb4_unicode_ci;