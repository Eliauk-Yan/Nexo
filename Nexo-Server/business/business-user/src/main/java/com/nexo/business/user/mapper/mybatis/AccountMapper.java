package com.nexo.business.user.mapper.mybatis;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexo.business.user.domain.entity.Account;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountMapper extends BaseMapper<Account> {
}
