package com.nexo.business.user.convert;

import com.nexo.business.user.domain.entity.User;
import com.nexo.common.api.user.response.data.UserInfo;
import org.mapstruct.Mapper;

/**
 * @classname UserConverter
 * @description 用户模块 MapStruct
 * @date 2025/12/03 18:59
 * @created by YanShijie
 */
@Mapper(componentModel = "spring")
public interface UserConverter {

    UserInfo userToUserInfo(User user);
}
