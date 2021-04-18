create table swappydb.rules_definition
(
    rd_id   smallint unsigned auto_increment
        primary key,
    rd_name varchar(128) not null,
    constraint processing_rules_rule_uindex
        unique (rd_name)
);

create table swappydb.user
(
    u_id    int unsigned auto_increment
        primary key,
    u_login varchar(40)  not null,
    u_email varchar(256) not null,
    u_hash  varchar(60)  not null,
    constraint user_email_uindex
        unique (u_email),
    constraint user_login_uindex
        unique (u_login)
);

create table swappydb.short_link
(
    sl_id            bigint unsigned auto_increment
        primary key,
    sl_short_url     varchar(200) not null,
    sl_creation_time datetime     not null,
    sl_user_id       int unsigned not null,
    constraint short_link_short_url_uindex
        unique (sl_short_url),
    constraint short_link_user_u_id_fk
        foreign key (sl_user_id) references swappydb.user (u_id)
);

create table swappydb.long_link
(
    ll_id            bigint unsigned auto_increment
        primary key,
    ll_long_url      varchar(2048)   not null,
    ll_creation_time datetime        not null,
    ll_sl_id         bigint unsigned not null,
    constraint long_link_short_link_sl_id_fk
        foreign key (ll_sl_id) references swappydb.short_link (sl_id)
);

create table swappydb.rules
(
    r_id           bigint unsigned auto_increment
        primary key,
    r_short_url_id bigint unsigned   not null,
    r_param        varchar(2048)     null,
    r_is_active    tinyint(1)        not null,
    r_rule_id      smallint unsigned not null,
    constraint rules_rules_definition_rd_id_fk
        foreign key (r_rule_id) references swappydb.rules_definition (rd_id),
    constraint rules_short_link_sl_id_fk
        foreign key (r_short_url_id) references swappydb.short_link (sl_id)
);

create table swappydb.stats
(
    s_id            bigint unsigned auto_increment
        primary key,
    s_sl_id         bigint unsigned    not null,
    s_date_time     datetime           not null,
    s_url_referrer  varchar(2048)      null,
    s_platform      varchar(255)       null,
    s_screen_width  mediumint unsigned null,
    s_screen_height mediumint unsigned null,
    s_ip_address    varchar(39)        null,
    constraint stats_short_link_sl_id_fk
        foreign key (s_sl_id) references swappydb.short_link (sl_id)
);


