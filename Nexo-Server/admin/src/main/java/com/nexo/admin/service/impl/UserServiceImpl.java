package com.nexo.admin.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.admin.domain.dto.UserQueryDTO;
import com.nexo.admin.domain.exception.AdminException;
import com.nexo.admin.domain.vo.UserVO;
import com.nexo.admin.service.UserService;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.request.UserListQueryRequest;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.condition.UserQueryById;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
import com.nexo.common.api.user.response.data.UserDTO;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.nexo.admin.domain.exception.AdminErrorCode.ADMIN_NOT_FOUND;

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
    public Boolean freeze(Long userId) {
        // 1. 验证当前操作用户是否是管理员
        verifyAdmin();
        // 2. 冻结用户
        UserResponse response = userFacade.freeze(userId);
        // 3. 重新查出用户信息，更新登录的session，确保用户权限实时更新
        refreshUserInSession(userId);
        // 4. 返回结果
        return response.getSuccess();
    }

    @Override
    public Boolean unfreeze(Long userId) {
        // 1. 验证当前操作用户是否是管理员
        verifyAdmin();
        // 2. 冻结用户
        UserResponse response = userFacade.unfreeze(userId);
        // 3. 重新查出用户信息，更新登录的session，确保用户权限实时更新
        refreshUserInSession(userId);
        // 4. 返回结果
        return response.getSuccess();
    }

    /**
     * 刷新用户信息到session
     * @param userId 用户ID
     */
    private void refreshUserInSession(Long userId) {
        UserQueryRequest request = new UserQueryRequest();
        request.setCondition(new UserQueryById(userId));
        UserQueryResponse<UserInfo> userQueryResponse = userFacade.userQuery(request);
        StpUtil.getSessionByLoginId(userId).set(userId.toString(), userQueryResponse.getData());
    }

    /**
     * 验证当前操作用户是否是管理员
     */
    private void verifyAdmin() {
        // 1. 查询管理员
        long adminId = StpUtil.getLoginIdAsLong();
        UserQueryRequest adminQueryRequest = new UserQueryRequest();
        adminQueryRequest.setCondition(new UserQueryById(adminId));
        UserQueryResponse<UserInfo> adminQueryResponse = userFacade.userQuery(adminQueryRequest);
        UserInfo userInfo = adminQueryResponse.getData();
        // 2. 用户不存在或者不是管理员用户
        if (userInfo == null || userInfo.getRole() != UserRole.ADMIN) {
            throw new AdminException(ADMIN_NOT_FOUND);
        }
    }
}
