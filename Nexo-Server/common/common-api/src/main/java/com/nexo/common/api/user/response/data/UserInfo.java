package com.nexo.common.api.user.response.data;

import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.constant.UserState;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * @classname UserInfo
 * @description 用户登录返回信息
 * @date 2025/12/03 12:58
 * @created by YanShijie
 */
@Data
public class UserInfo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String nickName;

    private String avatarUrl;

    private UserRole role;

    private UserState state;

    private String phone;

    private String email;

    private String address;

    private String inviteCode;

    private Boolean certification;

    private Boolean hasAppleBound;

    /**
     * 是否有购买资格
     */
    public boolean canBuy() {
        // 1. 角色不是普通人
        if (this.getRole() != null && this.getRole() != UserRole.COLLECTOR) {
            return false;
        }
        // 2. 状态不为激活 也就是没有实名认证或者被冻结
        if (this.getState() != null && this.getState() != UserState.ACTIVE) {
            return false;
        }
        // 3. 没有实名认证
        return this.getState() == null || this.certification;
    }

}
