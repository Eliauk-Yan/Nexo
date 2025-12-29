package com.nexo.business.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.RandomUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.service.UserService;
import com.nexo.business.user.mapper.mybatis.UserMapper;
import com.nexo.business.user.mapper.convert.UserConverter;
import com.nexo.business.user.interfaces.vo.UserProfileVO;
import com.nexo.common.api.user.constant.UserState;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.file.domain.enums.ServicePath;
import com.nexo.common.file.domain.enums.TypePath;
import com.nexo.common.file.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * @classname UserServiceImpl
 * @description 用户服务实现类
 * @date 2025/12/02 09:09
 * @created by YanShijie
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final String DEFAULT_NICK_NAME_PREFIX = "C_";

    private final UserConverter userConverter;

    private final UserMapper userMapper;

    private final MinioService minioService;

    @Override
    public void register(String phone, String inviteCode) {
        // 2. 生成默认昵称
        // TODO 后续加入布隆过滤器，优化用户名重复问题
        String random = RandomUtil.randomString(6);
        String defaultNickName = DEFAULT_NICK_NAME_PREFIX + random + phone.substring(7, 11);
        // 3. 查询邀请人
        Long invitorId = null;
        // 3.1 判断是否有邀请人
        if (inviteCode != null) {
            // 3.2 获取邀请人信息
            User invitor = this.getOne(new LambdaQueryWrapper<User>().eq(User::getInviteCode, inviteCode).eq(User::getDeleted, 0));
            if (invitor != null) {
                invitorId = invitor.getId();
            }
        }
        // 4. 保存用户
        User user = new User();
        user.setNickName(defaultNickName);
        user.setPhone(phone);
        user.setRole(UserRole.COLLECTOR);
        user.setState(UserState.INIT);
        // TODO 后续加入布隆过滤器，优化邀请码重复问题
        user.setInviteCode(RandomUtil.randomString(6));
        user.setInviterId(invitorId);
        this.save(user);
    }

    @Override
    public UserInfo queryUserByPhone(String phone) {
        // 1. 根据手机号查询用户信息
        User user = this.getOne(new LambdaQueryWrapper<User>().eq(User::getPhone, phone).eq(User::getDeleted, 0));
        // 2. 实体转换为DTO
        return userConverter.userToUserInfo(user);
    }

    @Override
    public UserProfileVO getUserProfile() {
        // 1. 获取当前登录用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 2. 根据用户ID查询用户账户信息
        return userMapper.selectUserProfileById(userId);
    }

    @Override
    public Boolean updateAvatar(MultipartFile avatar) {
        // 1. 获取当前登录用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 2. 根据用户ID查询用户信息
        User currentUser = this.getById(userId);
        // 3. 删除旧头像
        if (StringUtils.isNotBlank(currentUser.getAvatarUrl())) {
            minioService.deleteFile(currentUser.getAvatarUrl());
        }
        // 4. 上传新头像
        String avatarUrl = minioService.uploadFile(avatar, ServicePath.USER, TypePath.IMAGE);
        // 5. 更新用户信息
        currentUser.setAvatarUrl(avatarUrl);

        return this.updateById(currentUser);
    }

    @Override
    public Boolean updateNickName(String nickName) {
        // 1. 获取当前登录用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 2. 根据用户ID查询用户信息
        User user = this.getById(userId);
        // 3. 更新用户信息
        user.setNickName(nickName);
        // 4. 返回更新结果
        return this.updateById(user);
    }

}
