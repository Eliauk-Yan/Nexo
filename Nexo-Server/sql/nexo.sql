create table users
(
    id            bigint unsigned auto_increment comment '主键ID'
        primary key,
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
    real_name     text                                     null comment '真实姓名',
    id_card       text                                     null comment '身份证号',
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

create table trade_order
(
    id                bigint unsigned auto_increment comment '主键ID'
        primary key,
    order_id          varchar(32)                              not null comment '订单号',
    buyer_id          varchar(32)                              not null comment '买家ID',
    buyer_type        varchar(32)                              not null comment '买家类型',
    seller_id         varchar(32)                              not null comment '卖家ID',
    seller_type       varchar(32)                              not null comment '卖家类型',
    identifier        varchar(128)                             not null comment '幂等号',
    product_id        varchar(32)                              not null comment '商品ID',
    product_type      varchar(32)                              not null comment '商品类型',
    product_cover_url varchar(512)                             null comment '商品图片地址',
    product_name      varchar(1024)                            null comment '商品名称',
    unit_price        decimal(18, 6)                           null comment '商品单价',
    quantity          int                                      not null comment '商品数量',
    total_price       decimal(18, 6)                           not null comment '订单金额',
    order_state       varchar(32)                              not null comment '订单状态',
    payment_amount    decimal(18, 6)                           not null comment '已支付金额',
    payment_time      datetime                                 null comment '支付成功时间',
    confirmed_time    datetime                                 null comment '订单确认时间',
    completion_time   datetime                                 null comment '完结时间',
    closing_time      datetime                                 null comment '关单时间',
    payment_method    varchar(64)                              null comment '支付方式',
    payment_stream_id varchar(256)                             null comment '支付流水号',
    close_type        varchar(32)                              null comment '取消方式',
    snapshot_version  int                                      null comment '商品快照版本号',
    deleted           tinyint(1)  default 0                    null comment '是否逻辑删除，0为未删除，非0为已删除',
    version           int         default 1                    null comment '乐观锁版本号',
    created_at        datetime(3) default CURRENT_TIMESTAMP(3) not null comment '创建时间',
    updated_at        datetime(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3) comment '更新时间',
    constraint uk_order_id
        unique (order_id),
    constraint uk_request_id
        unique (identifier)
)
    comment '交易订单';

create table trade_order_stream
(
    id                bigint unsigned auto_increment comment '主键ID'
        primary key,
    order_id          varchar(32)                              not null comment '订单号',
    buyer_id          varchar(32)                              not null comment '买家ID',
    buyer_type        varchar(32)                              not null comment '买家类型',
    seller_id         varchar(32)                              not null comment '卖家ID',
    seller_type       varchar(32)                              not null comment '卖家类型',
    identifier        varchar(128)                             not null comment '幂等号',
    product_id        varchar(32)                              not null comment '商品ID',
    product_type      varchar(32)                              not null comment '商品类型',
    product_cover_url varchar(512)                             null comment '商品图片地址',
    product_name      varchar(1024)                            null comment '商品名称',
    unit_price        decimal(18, 6)                           null comment '商品单价',
    quantity          int                                      not null comment '商品数量',
    total_price       decimal(18, 6)                           not null comment '订单金额',
    order_state       varchar(32)                              not null comment '订单状态',
    payment_amount    decimal(18, 6)                           not null comment '已支付金额',
    payment_time      datetime                                 null comment '支付成功时间',
    confirmed_time    datetime                                 null comment '订单确认时间',
    completion_time   datetime                                 null comment '完结时间',
    closing_time      datetime                                 null comment '关单时间',
    payment_method    varchar(64)                              null comment '支付方式',
    pay_stream_id     varchar(256)                             null comment '支付流水号',
    close_type        varchar(32)                              null comment '关闭类型',
    snapshot_version  int                                      null comment '商品快照版本号',
    stream_identifier varchar(128)                             not null comment '幂等号',
    stream_type       varchar(128)                             not null comment '流水类型',
    deleted           tinyint(1)  default 0                    null comment '是否逻辑删除，0为未删除，非0为已删除',
    version           int         default 1                    null comment '乐观锁版本号',
    created_at        datetime(3) default CURRENT_TIMESTAMP(3) not null comment '创建时间',
    updated_at        datetime(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3) comment '更新时间'
);

create table pay_order
(
    id                       bigint unsigned auto_increment comment '主键ID'
        primary key,
    pay_order_id             varchar(32)                              not null comment '支付单号',
    payer_id                 varchar(32)                              not null comment '付款方ID',
    payer_type               varchar(32)                              not null comment '付款方类型',
    payee_id                 varchar(32)                              not null comment '收款方ID',
    payee_type               varchar(32)                              not null comment '收款方类型',
    biz_no                   varchar(128)                             not null comment '业务单号',
    biz_type                 varchar(32)                              not null comment '业务单类型',
    order_amount             decimal(18, 6)                           not null comment '订单金额',
    paid_amount              decimal(18, 6)                           null comment '已支付金额',
    channel_stream_id        varchar(64)                              null comment '渠道流水号',
    pay_url                  varchar(512)                             null comment '支付地址',
    pay_channel              varchar(64)                              not null comment '支付渠道',
    memo                     varchar(512)                             null comment '备注',
    order_state              varchar(64)                              not null comment '支付单状态',
    pay_succeed_time         datetime                                 null comment '支付成功时间',
    pay_expire_time          datetime                                 null comment '支付超时时间',
    refunded_amount          decimal(18, 6)                           null comment '退款金额',
    refund_channel_stream_id varchar(64)                              null comment '退款流水号',
    deleted                  tinyint(1)  default 0                    null comment '是否逻辑删除，0为未删除，非0为已删除',
    version                  int         default 1                    null comment '乐观锁版本号',
    created_at               datetime(3) default CURRENT_TIMESTAMP(3) not null comment '创建时间',
    updated_at               datetime(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3) comment '更新时间',
    constraint uk_pay_order_id
        unique (pay_order_id)
)
    comment '支付单表';

create index idx_biz_no
    on pay_order (biz_no);

create index idx_payer_id
    on pay_order (payer_id);

create table notification
(
    id           bigint unsigned auto_increment comment '主键ID'
        primary key,
    title        varchar(512) charset utf8mb3              null comment '通知标题',
    content      text charset utf8mb3                      null comment '通知内容',
    notify_type  varchar(128) charset utf8mb3              null comment '通知类型',
    target       varchar(256) charset utf8mb3              null comment '接收地址',
    state        varchar(128) charset utf8mb3              null comment '状态',
    success_time datetime                                  null comment '发送成功时间',
    fail_message text charset utf8mb3                      null comment '失败信息',
    created_at   datetime(3)  default CURRENT_TIMESTAMP(3) not null comment '创建时间',
    updated_at   datetime(3)  default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3) comment '更新时间',
    deleted      tinyint(1)   default 0                    not null comment '逻辑删除：0=正常，1=已删除',
    version      int unsigned default '1'                  not null comment '乐观锁版本号'
)
    comment '通知表';

create table nft_stream
(
    id                 bigint unsigned auto_increment comment '主键ID（自增主键）'
        primary key,
    name               varchar(512)   null comment '藏品名称',
    cover              varchar(512)   null comment '藏品封面',
    class_id           varchar(128)   null comment '藏品类目ID',
    nft_id             bigint         null comment '藏品id',
    price              decimal(18, 6) null comment '价格',
    quantity           bigint         null comment '藏品数量',
    description        text           null comment '详情',
    state              varchar(128)   null comment '状态',
    saleable_inventory bigint         null comment '可售库存',
    frozen_inventory   bigint         null comment '冻结库存',
    create_time        datetime       null comment '藏品创建时间',
    stream_type        varchar(128)   null comment '流水类型',
    sale_time          datetime       null comment '藏品发售时间',
    sync_chain_time    datetime       null comment '藏品上链时间',
    identifier         varchar(128)   null comment '幂等号',
    deleted            int            null comment '是否逻辑删除，0为未删除，非0为已删除',
    version            int            null comment '乐观锁版本号',
    created_at         datetime       not null comment '创建时间',
    updated_at         datetime       not null comment '最后更新时间',
    constraint uk_cid_type_iden
        unique (nft_id, stream_type, identifier)
)
    comment '藏品流水表' avg_row_length = 16384
                         row_format = DYNAMIC;

create table nft_snapshot
(
    id                 bigint unsigned auto_increment comment '主键ID（自增主键）'
        primary key,
    nft_id             bigint         not null comment '藏品id',
    name               varchar(512)   null comment '藏品名称',
    cover              varchar(512)   null comment '藏品封面',
    class_id           varchar(128)   null comment '藏品类目ID',
    price              decimal(18, 6) null comment '价格',
    quantity           bigint         null comment '藏品数量',
    description        text           null comment '详情',
    saleable_inventory bigint         null comment '可销售库存',
    sale_time          datetime       null comment '藏品发售时间',
    sync_chain_time    datetime       null comment '藏品上链时间',
    update_version     int            null comment '修改版本',
    deleted            int            null comment '是否逻辑删除，0为未删除，非0为已删除',
    version            int            null comment '乐观锁版本号',
    created_at         datetime       not null comment '创建时间',
    updated_at         datetime       not null comment '最后更新时间',
    create_time        datetime       null comment '创建时间'
)
    comment '藏品快照表';

create table nft_inventory_stream
(
    id                 bigint unsigned auto_increment comment '主键ID（自增主键）'
        primary key,
    nft_id             bigint         null comment '藏品id',
    changed_quantity   bigint         null comment '本次变更的数量',
    price              decimal(18, 6) null comment '价格',
    quantity           bigint         null comment '藏品数量',
    state              varchar(128)   null comment '状态',
    saleable_inventory bigint         null comment '可售库存',
    occupied_inventory bigint         null comment '已占库存',
    frozen_inventory   bigint         null comment '冻结库存',
    stream_type        varchar(128)   null comment '流水类型',
    identifier         varchar(128)   null comment '幂等号',
    extend_info        varchar(512)   null comment '扩展信息',
    deleted            int            null comment '是否逻辑删除，0为未删除，非0为已删除',
    version            int            null comment '乐观锁版本号',
    created_at         datetime       not null comment '创建时间',
    updated_at         datetime       not null comment '最后更新时间',
    constraint uk_cid_ident_type
        unique (nft_id, identifier, stream_type)
)
    comment '藏品库存流水表 ' avg_row_length = 16384
                              row_format = DYNAMIC;

create table nft
(
    id                 bigint unsigned auto_increment comment '藏品ID'
        primary key,
    name               varchar(512)                          null comment '藏品名称',
    cover              varchar(512)                          null comment '藏品封面',
    class_id           varchar(128)                          null comment '藏品类目ID',
    price              decimal(18, 6)                        null comment '价格',
    quantity           bigint                                null comment '藏品数量',
    description        text                                  null comment '详情描述',
    saleable_inventory bigint                                null comment '可销售库存',
    frozen_inventory   bigint      default 0                 null comment '冻结库存',
    identifier         varchar(128)                          null comment '幂等号',
    state              varchar(32) default 'PENDING'         null comment '藏品状态（未处理，上链成功，已下架）',
    sale_time          datetime                              null comment '藏品发售时间',
    sync_chain_time    datetime                              null comment '藏品上链时间',
    deleted            int         default 0                 null comment '是否逻辑删除，0为未删除，非0为已删除',
    version            int         default 1                 null comment '乐观锁版本号',
    created_at         timestamp   default CURRENT_TIMESTAMP null comment '记录创建时间',
    updated_at         timestamp   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '记录更新时间'
)
    comment '藏品表';

create table chain_operation_stream
(
    id             bigint unsigned auto_increment comment '主键ID'
        primary key,
    chain_type     varchar(32)                              not null comment '链类型(代码)',
    biz_type       varchar(32)                              not null comment '业务类型(代码)',
    biz_id         varchar(128)                             null comment '业务ID',
    operation_type varchar(32)                              not null comment '操作类型(代码)',
    state          varchar(32)                              not null comment '状态(代码)',
    operate_time   datetime                                 not null comment '操作发起时间',
    succeed_time   datetime                                 null comment '成功时间',
    out_biz_id     varchar(128)                             null comment '外部业务id',
    param          mediumtext                               null comment '入参',
    result         mediumtext                               null comment '返回结果',
    deleted        tinyint(1)  default 0                    null comment '是否逻辑删除，0为未删除，非0为已删除',
    version        int         default 1                    null comment '乐观锁版本号',
    created_at     datetime(3) default CURRENT_TIMESTAMP(3) not null comment '创建时间',
    updated_at     datetime(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3) comment '更新时间'
)
    comment '链操作日志';

create index idx_biz
    on chain_operation_stream (biz_type, biz_id);

create index idx_deleted
    on chain_operation_stream (deleted);

create index idx_out_biz_id
    on chain_operation_stream (out_biz_id);

create index idx_state_time
    on chain_operation_stream (state, operate_time);

create table assets
(
    id                 bigint unsigned auto_increment comment '主键ID（自增主键）'
        primary key,
    artwork_id         bigint unsigned                     null comment '藏品ID（外键，关联artworks表）',
    purchase_price     decimal(18, 6)                      null comment '购买价格',
    serial_number      varchar(256)                        null comment '藏品序列号',
    nft_identifier     varchar(256)                        null comment 'NFT唯一标识符',
    previous_holder_id bigint                              null comment '上一持有者ID',
    current_holder_id  bigint                              null comment '当前持有者ID',
    state              varchar(32)                         null comment '资产状态',
    transaction_hash   varchar(256)                        null comment '交易哈希',
    reference_price    decimal(18, 6)                      null comment '参考价格',
    rarity             varchar(64)                         null comment '稀有度',
    sync_chain_time    datetime                            null comment '藏品同步链时间',
    destruction_time   datetime                            null comment '藏品销毁时间',
    deleted            int       default 0                 null comment '是否逻辑删除，0为未删除，非0为已删除',
    business_no        varchar(128)                        null comment '业务单据号',
    business_type      varchar(64)                         null comment '业务类型',
    created_at         timestamp default CURRENT_TIMESTAMP null comment '记录创建时间',
    updated_at         timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '记录更新时间',
    version            int       default 1                 null comment '乐观锁版本号',
    constraint assets_ibfk_1
        foreign key (artwork_id) references artworks (id)
            on delete cascade
)
    comment '资产表';

create index artwork_id
    on assets (artwork_id);

create table asset_stream
(
    id          bigint auto_increment comment '主键'
        primary key,
    asset_id    bigint       not null comment '持有藏品的id',
    stream_type varchar(64)  not null comment '流水类型',
    operator    varchar(64)  not null comment '操作者',
    identifier  varchar(128) not null comment '幂等号',
    deleted     int          null comment '是否逻辑删除，0为未删除，非0为已删除',
    version     int          null comment '乐观锁版本号',
    create_at   datetime     not null comment '创建时间',
    update_at   datetime     not null comment '最后更新时间',
    constraint uk_held_id_type_iden
        unique (asset_id, stream_type, identifier)
)
    comment '资产流水表' charset = utf8mb3;

create index idx_held_id
    on asset_stream (asset_id);


