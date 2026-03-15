package com.nexo.business.user.mapper.convert;

import com.nexo.business.user.domain.entity.User;
import com.nexo.common.api.user.response.data.UserInfo;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * @classname UserConverter
 * @description 用户模块 MapStruct
 * @date 2025/12/03 18:59
 * @created by YanShijie
 */
@Mapper(componentModel = "spring")
public interface UserConverter {

    UserInfo toInfo(User user);

    List<UserInfo> toInfos(List<User> users);

}
