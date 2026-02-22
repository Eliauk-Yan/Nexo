import { request } from '@umijs/max';

/**
 * 登录 
 * @param body {API.LoginParams}
 * @returns {Promise<API.LoginResult>}
 */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
    return request<API.LoginResult>('/admin/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            phone: body.username,
            password: body.password,
            rememberMe: body.autoLogin,
        },
        ...(options || {}),
    });
}

/**
 * 退出登录
 * @returns {Promise<API.LogoutResult>}
 */
export async function logout(options?: { [key: string]: any }) {
    return request<API.LogoutResult>('/admin/auth/logout', {
        method: 'POST',
        ...(options || {}),
    });
}
