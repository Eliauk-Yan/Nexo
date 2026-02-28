package com.nexo.business.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.RandomUtil;
import com.alicp.jetcache.Cache;
import com.alicp.jetcache.CacheManager;
import com.alicp.jetcache.anno.CacheInvalidate;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.template.QuickConfig;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.nexo.business.user.config.encrypt.AesUtil;
import com.nexo.business.user.domain.entity.Certification;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.domain.exception.UserException;
import com.nexo.business.user.mapper.mybatis.CertificationMapper;
import com.nexo.business.user.service.UserService;
import com.nexo.business.user.mapper.mybatis.UserMapper;
import com.nexo.business.user.mapper.convert.UserConverter;
import com.nexo.business.user.interfaces.vo.UserProfileVO;
import com.nexo.common.api.user.constant.UserState;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.file.service.FileService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

import static com.nexo.business.user.domain.exception.UserErrorCode.*;

/**
 * @classname UserServiceImpl
 * @description 用户服务实现类
 * @date 2025/12/02 09:09
 * @created by YanShijie
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final String DEFAULT_NICK_NAME_PREFIX = "C_";

    private final UserConverter userConverter;

    private final UserMapper userMapper;

    private final FileService fileService;

    /**
     * 用户认证Mapper
     */
    private final CertificationMapper certificationMapper;

    /**
     * 用户缓存服务 为避免JetCache缓存失效
     */
    private final UserCacheService userCacheService;

    /**
     * 用户延迟双删 线程工厂
     */
    private static final ThreadFactory userCacheDelayProcessFactory = new ThreadFactoryBuilder()
            .setNameFormat("user-cache-delay-delete-pool-%d").build();

    /**
     * 用户延迟双删 线程池
     */
    private final ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(10,
            userCacheDelayProcessFactory);

    /**
     * 缓存管理器
     */
    private final CacheManager cacheManager;

    /**
     * 通过用户ID对用户信息做的缓存
     */
    private Cache<String, User> userCacheById;

    /**
     * JetCache 编程式缓存初始化
     */
    @PostConstruct
    public void init() {
        QuickConfig idQc = QuickConfig.newBuilder(":user:cache:id:")
                .cacheType(CacheType.BOTH)
                .expire(Duration.ofHours(2))
                .syncLocal(true)
                .build();
        userCacheById = cacheManager.getOrCreateCache(idQc);
    }

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
            User invitor = this
                    .getOne(new LambdaQueryWrapper<User>().eq(User::getInviteCode, inviteCode).eq(User::getDeleted, 0));
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
    public UserProfileVO getUserProfile() {
        // 1. 获取当前登录用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 2. 根据用户ID查询用户账户信息
        return userMapper.selectUserProfileById(userId);
    }

    @CacheInvalidate(name = ":user:cache:id:", key = "T(cn.dev33.satoken.stp.StpUtil).getLoginIdAsLong()")
    @Override
    public Boolean updateAvatar(MultipartFile avatar) {
        // 1. 获取当前登录用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 2. 根据用户ID查询用户信息
        User currentUser = userCacheService.getUserById(userId);
        // 3. 删除旧头像
        if (StringUtils.isNotBlank(currentUser.getAvatarUrl())) {
            fileService.deleteFile(currentUser.getAvatarUrl());
        }
        // 4. 设置文件路径（模块 + 唯一标识 + 功能 + 时间）
        String filePath = "user/" + userId + "/avatar/"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        // 5. 上传文件
        String avatarUrl = fileService.uploadFile(avatar, filePath);
        // 6. 更新用户信息
        currentUser.setAvatarUrl(avatarUrl);
        return this.updateById(currentUser);
    }

    @CacheInvalidate(name = ":user:cache:id:", key = "T(cn.dev33.satoken.stp.StpUtil).getLoginIdAsLong()")
    @Override
    public Boolean updateNickName(String nickName) {
        // 1. 获取当前登录用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 2. 根据用户ID查询用户信息
        User user = userCacheService.getUserById(userId);
        // 3. 更新用户信息
        user.setNickName(nickName);
        // 4. 返回更新结果
        return this.updateById(user);
    }

    @Override
    public UserInfo queryUserByPhone(String phone) {
        // 1. 根据手机号查询用户信息
        User user = this.getOne(new LambdaQueryWrapper<User>().eq(User::getPhone, phone));
        // 2. 实体转换为DTO
        return userConverter.userToUserInfo(user);
    }

    @Override
    public UserInfo queryUserById(Long id) {
        // 1. 根据手机号查询用户信息
        User user = userCacheService.getUserById(id);
        // 2. 实体转换为DTO
        UserInfo userInfo = userConverter.userToUserInfo(user);
        // TODO fix 2月26日 修改 BUG（用户是否实名信息遗漏）
        Certification certification = certificationMapper
                .selectOne(new LambdaQueryWrapper<Certification>().eq(Certification::getUserId, id));
        userInfo.setCertification(certification != null);
        return userInfo;
    }

    @Override
    public UserInfo queryUserByPhoneAndPassword(String phone, String password) {
        // 1. 加密密码
        String encryptedPassword = AesUtil.encrypt(password);
        // 2. 对比密码
        User user = this.getOne(
                new LambdaQueryWrapper<User>().eq(User::getPhone, phone).eq(User::getPassword, encryptedPassword));
        // 3. 返回结果
        return userConverter.userToUserInfo(user);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean freeze(Long userId) {
        // 1. 根据用户ID查询用户信息
        User user = userCacheService.getUserById(userId);
        if (user == null) {
            throw new UserException(USER_NOT_EXIST);
        }
        if (user.getState() != UserState.ACTIVE) {
            throw new UserException(USER_STATUS_IS_NOT_ACTIVE);
        }
        // 1. 第一次删除缓存
        userCacheById.remove(user.getId().toString());
        if (user.getState() == UserState.FROZEN) {
            return true;
        }
        // 2. 更新用户状态
        user.setState(UserState.FROZEN);
        boolean updateResult = updateById(user);
        if (!updateResult) {
            throw new UserException(USER_UPDATE_FAILED);
        }
        // 3. 第二次删除缓存
        scheduler.schedule(() -> {
            boolean idDeleteResult = userCacheById.remove(user.getId().toString());
            log.info("用户延迟双删, key = {} , result  = {}", user.getId(), idDeleteResult);
        }, 2, TimeUnit.SECONDS);
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean unfreeze(Long userId) {
        // 1. 根据用户ID查询用户信息
        User user = userCacheService.getUserById(userId);
        if (user == null) {
            throw new UserException(USER_NOT_EXIST);
        }
        if (user.getState() != UserState.FROZEN) {
            throw new UserException(USER_STATUS_IS_NOT_FROZEN);
        }
        // 1. 第一次删除缓存
        userCacheById.remove(user.getId().toString());
        if (user.getState() == UserState.ACTIVE) {
            return true;
        }
        // 2. 更新用户状态
        user.setState(UserState.ACTIVE);
        boolean updateResult = updateById(user);
        if (!updateResult) {
            throw new UserException(USER_UPDATE_FAILED);
        }
        // 3. 第二次删除缓存
        scheduler.schedule(() -> {
            boolean idDeleteResult = userCacheById.remove(user.getId().toString());
            log.info("用户延迟双删, key = {} , result  = {}", user.getId(), idDeleteResult);
        }, 2, TimeUnit.SECONDS);
        return true;
    }

}
