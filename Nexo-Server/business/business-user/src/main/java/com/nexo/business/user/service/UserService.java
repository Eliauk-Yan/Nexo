package com.nexo.business.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.base.response.PageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService extends IService<User> {


    /**
     * 更新用户头像
     */
    Boolean updateAvatar(MultipartFile avatar);

    /**
     * 更新用户昵称
     */
    Boolean updateNickName(String nickName);

    /**
     * 根据id查询用户信息
     */
    UserInfo queryUserById(Long id);

    /**
     * 用户实名认证
     */
    void realNameAuth(RealNameAuthDTO dto);

    /**
     * 用户注册
     */
    Boolean register(String phone);

    /**
     * 根据手机号查询用户信息
     */
    UserInfo queryUserByPhone(String phone);

    /**
     * 冻结用户
     */
    Boolean freeze(Long userId);

    /**
     * 解冻用户
     */
    Boolean unfreeze(Long userId);

    /**
     * 根据关键字分页查询用户信息
     */
    PageResponse<User> pageQueryByState(String keyword, String state, String nickName, String role, Boolean certification, int current, int size);
}
