/**
 * 认证相关 API
 * 封装所有认证相关的 API 请求方法
 */

import { API_ENDPOINTS } from '@/constants/api'
import { LoginForm, LoginResponse } from '@/types'
import { request } from '@/utils/request'

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
