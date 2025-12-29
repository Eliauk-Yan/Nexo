package com.nexo.business.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.interfaces.vo.UserProfileVO;
import com.nexo.common.api.user.response.data.UserInfo;
import org.springframework.web.multipart.MultipartFile;

public interface UserService extends IService<User> {

    /**
     * 新用户注册
     * @param phone 手机号
     * @param inviteCode 邀请码（可选）
     */
    void register(String phone, String inviteCode);


    /**
     * 根据手机号查询用户信息
     * @param phone 手机号
     * @return 用户信息
     */
    UserInfo queryUserByPhone(String phone);

    /**
     * 获取用户信息
     * @return 用户信息
     */
    UserProfileVO getUserProfile();

    /**
     * 更新用户头像
     * @param avatar 头像图片
     * @return 更新结果
     */
    Boolean updateAvatar(MultipartFile avatar);

    Boolean updateNickName(String nickName);
}
