package com.nexo.business.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.user.domain.entity.Account;
import com.nexo.business.user.mapper.mybatis.AccountMapper;
import com.nexo.business.user.service.AccountService;
import org.springframework.stereotype.Service;

/**
 * @classname AccountServiceImpl
 * @description 账户服务实现类
 * @date 2026/01/03 19:01
 */
@Service
public class AccountServiceImpl extends ServiceImpl<AccountMapper, Account> implements AccountService {


}
