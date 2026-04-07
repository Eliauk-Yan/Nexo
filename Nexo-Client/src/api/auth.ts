import { post, get } from '@/utils/request'
import type { UserInfo as UserInfoProfile } from '@/api/user'

/**
 * 登录表单
 */
export interface LoginForm {
  phone: string
  verifyCode: string
  rememberMe: boolean
}

/** 会话中的用户信息，与 api/user 的 UserInfo 兼容 */
export type UserInfo = UserInfoProfile

/**
 * 登录响应类型（C 端登录仅返回 token、expire，不包含 userInfo）
 */
export interface LoginResponse {
  token: string
  expire: number
  userInfo?: UserInfo
}

export interface TokenRequest {
  scene: string
  key: string
}

export const authApi = {
  /**
   * 发送验证码
   */
  sendVerificationCode: (phone: string) => {
    const url = `/auth/verifyCode?phone=${encodeURIComponent(phone)}`
    return post(url, undefined)
  },

  /**
   * 登录
   */
  login: (data: LoginForm) => {
    return post('/auth/login', {
      phone: data.phone,
      verifyCode: data.verifyCode,
      rememberMe: data.rememberMe ?? true,
    })
  },

  /**
   * Apple 登录
   */
  appleLogin: (data: { identityToken: string; authorizationCode: string | null; user: string | null }) => {
    return post('/auth/login/apple', data)
  },

  /**
   * Apple 绑定
   */
  bindApple: (data: { identityToken: string; authorizationCode: string | null; user: string | null }) => {
    return post('/auth/bind/apple', data)
  },

  /**
   * 登出
   */
  logout: () => {
    return post('/auth/logout', undefined)
  },

  /**
   * 获取当前用户信息（头像、昵称、链地址等），登录后若未返回 userInfo 时用此接口拉取
   * @param token 登录后拿到的 token，用于首次请求（此时尚未写入存储）
   */
  getCurrentUser: (token: string) => {
    return get<UserInfoProfile>('/user/profile', undefined, { token }).then((data) => ({
      id: data?.id ?? '',
      nickName: data?.nickName ?? '',
      avatarUrl: data?.avatarUrl ?? '',
      role: data?.role ?? '',
      phone: data?.phone,
      email: data?.email,
      // 后端目前返回的是 address，这里兼容映射到前端使用的 account 字段
      account: (data as any).address ?? (data as any).account,
      certification: data?.certification,
      state: data?.state,
    }))
  },

  /**
   * 获取放重token
   */
  getToken: (request: TokenRequest) => {
    return get<string>('/auth/token', request)
  },
}
