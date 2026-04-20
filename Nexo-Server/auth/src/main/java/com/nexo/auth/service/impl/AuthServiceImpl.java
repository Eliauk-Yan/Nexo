package com.nexo.auth.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.stp.parameter.SaLoginParameter;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.nexo.auth.interfaces.dto.AppleLoginDTO;
import com.nexo.auth.interfaces.dto.LoginDTO;
import com.nexo.auth.interfaces.vo.LoginVO;
import com.nexo.auth.domain.exception.AuthException;
import com.nexo.auth.service.AuthService;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.UserRegisterRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.UserResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Base64;
import java.util.Objects;

import static com.nexo.auth.domain.constant.AuthConstant.SESSION_TIMEOUT;
import static com.nexo.auth.domain.exception.AuthErrorCode.*;
import static com.nexo.common.api.notification.constant.NotificationConstant.CAPTCHA_KEY_PREFIX;

/**
 * @classname AuthServiceImpl
 * @description 认证相关服务实现类
 * @date 2025/12/01 18:02
 * @created by YanShijie
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    /**
     * Redis 字符串模板类
     */
    private final StringRedisTemplate stringRedisTemplate;

    /**
     * 用户服务接口
     */
    @DubboReference(version = "1.0.0")
    private UserFacade userFacade;


    @Override
    public LoginVO login(LoginDTO request) {
        // 1. 校验验证码
        isValidVerifyCode(request.getPhone(), request.getVerifyCode());
        // 2. 校验用户已存在
        UserInfo userInfo = checkUser(request.getPhone());
        if (userInfo == null) {
            // 3. 注册用户
            // 3.1 构造注册请求
            UserRegisterRequest registerRequest = new UserRegisterRequest();
            registerRequest.setPhone(request.getPhone());
            registerRequest.setInviteCode(request.getInviteCode());
            // 3.2 注册用户
            UserResponse register = userFacade.register(registerRequest);
            // 4. 返回结果
            if (!register.getSuccess()) {
                throw new AuthException(USER_REGISTER_FAILED);
            }
        }
        // 4. 获取用户信息
        userInfo = checkUser(request.getPhone());
        if (userInfo == null) {
            throw new AuthException(USER_NOT_EXIST);
        }
        return userLogin(userInfo, request.getRememberMe());
    }

    @Override
    public LoginVO loginAdmin(LoginDTO request) {
        // 1. 校验验证码
        isValidVerifyCode(request.getPhone(), request.getVerifyCode());
        // 2. 校验用户已存在
        UserInfo userInfo = checkUser(request.getPhone());
        if (userInfo == null) {
            throw new AuthException(USER_NOT_EXIST);
        }
        // 3. 校验用户权限
        if (userInfo.getRole() != UserRole.ADMIN) {
            throw new AuthException(USER_NOT_ADMIN);
        }
        // 4. 用户登录
        return userLogin(userInfo, request.getRememberMe());
    }

    @Override
    public LoginVO loginByApple(AppleLoginDTO dto) {
        // 1. 获取身份信息token
        String identityToken = dto.getIdentityToken();
        if (!StringUtils.hasText(identityToken)) {
            throw new IllegalArgumentException("identity token is required");
        }
        // 简单解析 JWT 中间段，不进行签名校验 (这里依赖 Apple 客户端 SDK 的可靠性做 MVP，实际环境由于 JWT
        // 是客户端发来的，建议使用公钥校验)
        String[] parts = identityToken.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid identity token");
        }
        String sub = null;
        String email = null;
        try {
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            com.alibaba.fastjson2.JSONObject jsonObject = com.alibaba.fastjson2.JSON.parseObject(payload);
            sub = jsonObject.getString("sub");
            email = jsonObject.getString("email");
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to decode token", e);
        }
        if (!StringUtils.hasText(sub)) {
            throw new IllegalArgumentException("Token missing sub");
        }
        // 这里传的 dto.getUser() 可能包含 fullName（首次授权时），可用于初始化昵称
        UserQueryResponse<UserInfo> response = userFacade.loginOrRegisterByAuth("apple", sub, dto.getUser(), email);
        if (!response.getSuccess() || response.getData() == null) {
            throw new AuthException(THIRD_PARTY_UNBOUND);
        }
        return userLogin(response.getData(), true);
    }

    @Override
    public Boolean bindByApple(AppleLoginDTO dto) {
        String identityToken = dto.getIdentityToken();
        if (!StringUtils.hasText(identityToken)) {
            throw new IllegalArgumentException("identity token is required");
        }
        String[] parts = identityToken.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid identity token");
        }
        String sub = null;
        try {
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            JSONObject jsonObject = JSON.parseObject(payload);
            sub = jsonObject.getString("sub");
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to decode token", e);
        }

        if (!StringUtils.hasText(sub)) {
            throw new IllegalArgumentException("Token missing sub");
        }

        Long userId = StpUtil.getLoginIdAsLong();
        try {
            UserResponse response = userFacade.bindUserAuth(userId, "apple", sub);
            return response.getSuccess();
        } catch (Exception e) {
            // Dubbo跨服务调用时 统一异常处理检测不到异常所以在这里手动捕获
            throw new AuthException(APPLE_ALREADY_BOUND);
        }
    }

    /**
     * 校验验证码是否有效
     */
    private void isValidVerifyCode(String phone, String verifyCode) {
        if (!StringUtils.hasText(phone) || !StringUtils.hasText(verifyCode)) {
            throw new AuthException(VERIFY_CODE_ERROR);
        }
        // 1. 获取验证码
        String key = CAPTCHA_KEY_PREFIX + phone;
        String code = stringRedisTemplate.opsForValue().get(key);
        // 2. 判断验证码是否一致
        if (!Objects.equals(code, verifyCode)) {
            throw new AuthException(VERIFY_CODE_ERROR);
        }
        // 3. 校验通过后移除验证码，避免重复使用
        stringRedisTemplate.delete(key);
    }

    /**
     * 检查用户是否存在
     */
    private UserInfo checkUser(String phone) {
        // 1. 构造查询请求
        UserQueryRequest queryRequest = new UserQueryRequest();
        queryRequest.setPhone(phone);
        // 2. 根据手机号查询用户信息
        UserQueryResponse<UserInfo> queryResponse = userFacade.userQuery(queryRequest);
        // 3. 从查询响应拿到数据
        return queryResponse.getData();
    }

    /**
     * 用户SATOKEN登录逻辑封装
     */
    private LoginVO userLogin(UserInfo userInfo, boolean rememberMe) {
        StpUtil.login(userInfo.getId(),
                new SaLoginParameter().setIsLastingCookie(rememberMe).setTimeout(SESSION_TIMEOUT));
        // 1. 保存用户信息到会话
        StpUtil.getSession().set("userInfo", userInfo);
        // 2. 删除验证码
        stringRedisTemplate.delete(CAPTCHA_KEY_PREFIX + userInfo.getPhone());
        // 3. 封装返回数据
        return new LoginVO(StpUtil.getTokenValue(), StpUtil.getSessionTimeout());
    }
}
