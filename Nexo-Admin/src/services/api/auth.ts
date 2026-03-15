import { request } from '@umijs/max';

/**
 * 获取当前登录用户信息（头像、昵称等），需在登录后携带 token 调用
 * @returns {Promise<API.CurrentUser>}
 */
export async function getCurrentUser(options?: { [key: string]: any }) {
    return request<API.CurrentUser>('/admin/user/info', {
        method: 'GET',
        ...(options || {}),
    });
}

/**
 * 发送手机验证码（auth 模块）
 * @param phone 手机号
 */
export async function sendVerifyCode(phone: string, options?: { [key: string]: any }) {
    return request<{ success: boolean; data: boolean }>('/auth/verifyCode', {
        method: 'POST',
        params: { phone },
        ...(options || {}),
    });
}

/**
 * 管理员登录（手机号+验证码，auth 模块）
 * @param body { phone, verifyCode, rememberMe }
 * @returns {Promise<API.LoginResult>}
 */
export async function login(body: API.AdminLoginParams, options?: { [key: string]: any }) {
    return request<API.LoginResult>('/auth/login/admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            phone: body.phone,
            verifyCode: body.verifyCode,
            rememberMe: body.autoLogin,
        },
        ...(options || {}),
    });
}

/**
 * 退出登录（auth 模块）
 * @returns {Promise<API.LogoutResult>}
 */
export async function logout(options?: { [key: string]: any }) {
    return request<API.LogoutResult>('/auth/logout', {
        method: 'POST',
        ...(options || {}),
    });
}
