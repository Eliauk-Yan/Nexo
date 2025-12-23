package com.nexo.gateway.auth;

import cn.dev33.satoken.stp.StpInterface;
import cn.dev33.satoken.stp.StpUtil;
import com.nexo.common.api.user.constant.UserPermission;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.response.data.UserInfo;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @classname StpInterfaceImpl
 * @description Sa-Token 权限验证接口实现类
 * @date 2025/12/08 20:03
 * @created by YanShijie
 */
@Component
public class StpInterfaceImpl implements StpInterface {

    /**
     *
     * @param loginId  账号id
     * @param loginType 账号类型
     * @return 权限列表
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        UserInfo userInfo = this.getUserInfo(loginId);
        if (userInfo == null) {
            return List.of();
        }
        // 目前仅返回基础权限，可根据业务扩展
        return List.of(UserPermission.BASIC.getCode());
    }

    /**
     *
     * @param loginId  账号id
     * @param loginType 账号类型
     * @return 角色列表
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        UserInfo userInfo = this.getUserInfo(loginId);
        if (userInfo == null || userInfo.getRole() == null) {
            return List.of();
        }
        return List.of(userInfo.getRole().getCode());
    }

    private UserInfo getUserInfo(Object loginId) {
        return StpUtil.getSessionByLoginId(loginId).getModel("userInfo", UserInfo.class);
    }
}
