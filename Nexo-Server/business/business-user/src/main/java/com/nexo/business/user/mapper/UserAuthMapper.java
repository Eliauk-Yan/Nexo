package com.nexo.business.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexo.business.user.domain.entity.UserAuth;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserAuthMapper extends BaseMapper<UserAuth> {
}
