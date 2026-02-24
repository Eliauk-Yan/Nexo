package com.nexo.admin.service;

import com.nexo.admin.domain.dto.UserCreateDTO;
import com.nexo.admin.domain.dto.UserQueryDTO;
import com.nexo.admin.domain.dto.UserUpdateDTO;
import com.nexo.admin.domain.vo.UserVO;
import com.nexo.common.web.result.MultiResult;

public interface UserService {

    MultiResult<UserVO> getUserList(UserQueryDTO dto);

    Boolean addUser(UserCreateDTO dto);

    Boolean updateUser(UserUpdateDTO dto);

    Boolean deleteUser(Long id);

}
