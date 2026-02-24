package com.nexo.admin.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.admin.domain.dto.UserCreateDTO;
import com.nexo.admin.domain.dto.UserQueryDTO;
import com.nexo.admin.domain.dto.UserUpdateDTO;
import com.nexo.admin.domain.exception.AdminException;
import com.nexo.admin.domain.vo.UserVO;
import com.nexo.admin.service.UserService;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.request.UserListQueryRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.data.UserDTO;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    @DubboReference(version = "1.0.0")
    private UserFacade userFacade;

    @Override
    public MultiResult<UserVO> getUserList(UserQueryDTO dto) {
        UserListQueryRequest request = new UserListQueryRequest();
        request.setCurrent(dto.getCurrent());
        request.setSize(dto.getSize());
        request.setNickName(dto.getNickName());
        request.setPhone(dto.getPhone());

        UserQueryResponse<Page<UserDTO>> response = userFacade.getUserList(request);
        if (response.getData() == null) {
            throw new AdminException(com.nexo.admin.domain.exception.AdminErrorCode.GET_USER_FAILED);
        }
        List<UserVO> list = response.getData().getRecords().stream().map(item -> {
            UserVO vo = new UserVO();
            BeanUtils.copyProperties(item, vo);
            return vo;
        }).collect(Collectors.toList());

        return MultiResult.multiSuccess(list, response.getData().getTotal(), response.getData().getCurrent(),
                response.getData().getSize());
    }

    @Override
    public Boolean addUser(UserCreateDTO dto) {
        UserDTO userDTO = new UserDTO();
        BeanUtils.copyProperties(dto, userDTO);
        return userFacade.addUser(userDTO);
    }

    @Override
    public Boolean updateUser(UserUpdateDTO dto) {
        UserDTO userDTO = new UserDTO();
        BeanUtils.copyProperties(dto, userDTO);
        return userFacade.updateUser(userDTO);
    }

    @Override
    public Boolean deleteUser(Long id) {
        return userFacade.deleteUser(id);
    }
}
