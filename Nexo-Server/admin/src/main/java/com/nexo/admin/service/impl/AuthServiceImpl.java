package com.nexo.admin.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.admin.domain.dto.LoginDTO;
import com.nexo.admin.domain.exception.AdminException;
import com.nexo.admin.domain.vo.LoginVO;
import com.nexo.admin.service.AuthService;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.condition.UserQueryByPhoneAndPassword;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;

import static com.nexo.admin.domain.exception.AdminErrorCode.ADMIN_NOT_FOUND;

/**
 * @classname AuthServiceImpl
 * @description 管理原认证服务实现类
 * @date 2026/02/19 01:27
 */
@Service
public class AuthServiceImpl implements AuthService {

    @DubboReference(version = "1.0.0")
    private UserFacade userFacade;

    @Override
    public LoginVO login(LoginDTO params) {
        // 1. 查询管理员信息
        UserQueryRequest request = new UserQueryRequest();
        UserQueryByPhoneAndPassword condition = new UserQueryByPhoneAndPassword(params.getPhone(), params.getPassword());
        request.setCondition(condition);
        UserQueryResponse<UserInfo> response = userFacade.userQuery(request);
        // 2. 获取管理员信息
        UserInfo userInfo = response.getData();
        if (userInfo != null && userInfo.getRole() == UserRole.ADMIN) {
            // 3. 管理员登录
            // 3.1 用户登录
            StpUtil.login(userInfo.getId(), params.getPhone());
            StpUtil.getSession().set(userInfo.getId().toString(), userInfo);
            LoginVO loginVO = new LoginVO();
            // 3.2 构造填充并返回登录信息
            loginVO.setUserId(userInfo.getId());
            loginVO.setToken(StpUtil.getTokenValue());
            loginVO.setTokenExpiration(StpUtil.getTokenSessionTimeout());
            loginVO.setUserInfo(userInfo);
            return loginVO;
        }
        // 4. 抛出管理员没有找到异常
        throw new AdminException(ADMIN_NOT_FOUND);
    }
}
