import { post } from '@/utils/request'

/**
 * 登录表单
 */
export interface LoginForm {
  phone: string
  verifyCode: string
  rememberMe: boolean
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string
  nickName: string
  avatarUrl: string
  role: string
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  token: string
  expire: number
  userInfo: UserInfo
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
   * 登出
   */
  logout: () => {
    return post('/auth/logout', undefined)
  },
}
