import { API_ENDPOINTS } from '@/constants/api'
import { request } from '@/utils/request'

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
    const url = `${API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE}?phone=${encodeURIComponent(phone)}`
    return request.post<boolean>(url, undefined)
  },

  /**
   * 登录
   */
  login: (data: LoginForm) => {
    return request.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      phone: data.phone,
      verifyCode: data.verifyCode,
      rememberMe: data.rememberMe ?? true,
    })
  },

  /**
   * 登出
   */
  logout: () => {
    return request.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
  },
}
