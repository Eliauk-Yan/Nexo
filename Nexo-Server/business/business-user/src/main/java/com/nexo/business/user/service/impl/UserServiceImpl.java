package com.nexo.business.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.RandomUtil;
import com.alicp.jetcache.Cache;
import com.alicp.jetcache.CacheManager;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.template.QuickConfig;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.domain.exception.UserErrorCode;
import com.nexo.business.user.domain.exception.UserException;
import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserAuthService;
import com.nexo.business.user.service.UserService;
import com.nexo.business.user.mapper.mybatis.UserMapper;
import com.nexo.business.user.mapper.UserAuthMapper;
import com.nexo.business.user.mapper.convert.UserConverter;
import com.nexo.business.user.domain.entity.UserAuth;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainCreateData;
import com.nexo.common.api.user.constant.UserState;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.base.constant.CommonConstant;
import com.nexo.common.base.response.PageResponse;
import com.nexo.common.file.service.FileService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.dubbo.config.annotation.DubboReference;
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

    private final UserAuthMapper userAuthMapper;

    private final FileService fileService;

    @DubboReference(version = "1.0.0")
    private ChainFacade chainFacade;

    /**
     * 用户认证服务
     */
    private final UserAuthService userAuthService;

    /**
     * 用户缓存服务
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
    public Boolean register(String phone) {
        // 1. 生成默认昵称
        String random = RandomUtil.randomString(6);
        String defaultNickName = DEFAULT_NICK_NAME_PREFIX + random + phone.substring(7, 11);
        // 2. 保存用户
        User user = new User();
        user.register(defaultNickName, phone);
        int insertRow = userMapper.insert(user);
        return insertRow == 1;
    }

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
        return userCacheService.updateById(currentUser);
    }

    @Override
    public Boolean updateNickName(String nickName) {
        // 1. 获取当前登录用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 2. 根据用户ID查询用户信息
        User user = userCacheService.getUserById(userId);
        // 3. 更新用户信息
        user.setNickName(nickName);
        // 4. 返回更新结果
        return userCacheService.updateById(user);
    }

    @Override
    public UserInfo queryUserByPhone(String phone) {
        // 1. 根据手机号查询用户信息
        User user = this.getOne(new LambdaQueryWrapper<User>().eq(User::getPhone, phone));
        // 2. 实体转换为DTO
        return userConverter.toInfo(user);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public UserInfo loginOrRegisterByAuth(String authType, String authKey, String name, String email) {
        // 1.查询是否有用户绑定
        UserAuth userAuth = userAuthMapper.selectOne(new LambdaQueryWrapper<UserAuth>()
                .eq(UserAuth::getAuthType, authType)
                .eq(UserAuth::getAuthKey, authKey));
        // 2. 如果绑定获取用户信息
        User user = null;
        if (userAuth != null) {
            user = this.getById(userAuth.getUserId());
        }
        // 3. 如果没有绑定返回null让调用者处
        if (user == null) {
            return null;
        }
        return userConverter.toInfo(user);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean bindUserAuth(Long userId, String authType, String authKey) {
        // 先检查该authKey是否已被绑定
        Long count = userAuthMapper.selectCount(new LambdaQueryWrapper<UserAuth>()
                .eq(UserAuth::getAuthType, authType)
                .eq(UserAuth::getAuthKey, authKey));
        if (count != null && count > 0) {
            throw new UserException(UserErrorCode.USER_UPDATE_FAILED); // 已被其他用户绑定
        }
        
        UserAuth newUserAuth = new UserAuth();
        newUserAuth.setUserId(userId);
        newUserAuth.setAuthType(authType);
        newUserAuth.setAuthKey(authKey);
        int rows = userAuthMapper.insert(newUserAuth);
        return rows > 0;
    }

    @Override
    public UserInfo queryUserById(Long id) {
        // 1. 根据手机号查询用户信息
        User user = userCacheService.getUserById(id);
        // 2. 实体转换为DTO
        UserInfo userInfo = userConverter.toInfo(user);
        // 3. 是否苹果认证
        if (userInfo != null) {
            Long count = userAuthMapper.selectCount(new LambdaQueryWrapper<UserAuth>()
                    .eq(UserAuth::getUserId, id)
                    .eq(UserAuth::getAuthType, "apple"));
            userInfo.setHasAppleBound(count != null && count > 0);
        }
        
        return userInfo;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void realNameAuth(RealNameAuthDTO dto) {
        // 1. 调用用户认证服务
        if (!userAuthService.realNameAuth(dto)) {
            throw new UserException(UserErrorCode.REAL_NAME_AUTH_FAILED);
        }
        // 2. 从数据库取最新用户（避免乐观锁 version 与缓存不一致导致 update 影响 0 行）
        long userId = StpUtil.getLoginIdAsLong();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new UserException(UserErrorCode.USER_NOT_EXIST);
        }
        user.setRealName(dto.getRealName());
        user.setIdCard(dto.getIdCardNo());
        // 3. 保存实名信息
        Boolean realAuthRes = userCacheService.updateById(user);
        if (!realAuthRes) {
            throw new UserException(UserErrorCode.USER_UPDATE_FAILED);
        }
        // 4. 构造创建链账户请求
        ChainRequest chainRequest = new ChainRequest();
        chainRequest.setUserId(String.valueOf(userId));
        String identifier = CommonConstant.APP_NAME + CommonConstant.SEPARATOR + userId;
        chainRequest.setIdentifier(identifier);
        ChainResponse<ChainCreateData> chainAccount = chainFacade.createChainAccount(chainRequest);
        if (chainAccount.getSuccess()) {
            // 5. 保存链账户信息
            User userForChain = userMapper.selectById(userId);
            if (userForChain == null) {
                throw new UserException(UserErrorCode.USER_NOT_EXIST);
            }
            ChainCreateData responseData = chainAccount.getData();
            userForChain.setAddress(responseData.getAccount());
            userForChain.setPlatform(responseData.getPlatform());
            Boolean accountRes = userCacheService.updateById(userForChain);
            if (!accountRes) {
                throw new UserException(UserErrorCode.USER_CREATE_CHAIN_FAIL);
            }
            // 6. 更新用户以及认证状态
            User currentUser = userMapper.selectById(userId);
            currentUser.setState(UserState.ACTIVE);
            currentUser.setCertification(true);
            Boolean update = userCacheService.updateById(currentUser);
            if (!update) {
                throw new UserException(UserErrorCode.USER_UPDATE_FAILED);
            }
            // 6. 更新会话状态
            UserInfo userInfo = StpUtil.getSessionByLoginId(userId).getModel("userInfo", UserInfo.class);
            userInfo.setState(UserState.ACTIVE);
            userInfo.setCertification(true);
            userInfo.setAddress(responseData.getAccount());
            StpUtil.getSession().set("userInfo", userInfo);
        } else {
            throw new UserException(UserErrorCode.USER_CREATE_CHAIN_FAIL);
        }
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

    @Override
    public PageResponse<User> pageQueryByState(String keyword, String state, String nickName, String role,
            Boolean certification, int current, int size) {
        // 1. 构建页面
        Page<User> page = new Page<>(current, size);
        // 2. 构造查询条件
        LambdaQueryWrapper<User> condition = new LambdaQueryWrapper<User>()
                .eq(StringUtils.isNotBlank(state), User::getState, state)
                .like(StringUtils.isNotBlank(keyword), User::getPhone, keyword)
                .like(StringUtils.isNotBlank(nickName), User::getNickName, nickName)
                .eq(StringUtils.isNotBlank(role), User::getRole, role)
                .eq(certification != null, User::getCertification, certification)
                .orderByAsc(User::getCreatedAt);
        // 3. Mapper查询
        Page<User> userPage = userMapper.selectPage(page, condition);
        // 4. 返回响应
        return PageResponse.success(userPage.getRecords(), (int) userPage.getTotal(), size, current);
    }

}
