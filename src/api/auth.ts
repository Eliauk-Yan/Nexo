/**
 * 认证相关 API
 * 封装所有认证相关的 API 请求方法
 */

import { USE_MOCK } from '@/config/env'
import { API_ENDPOINTS } from '@/constants/api'
import { LoginForm, RegisterForm, User } from '@/types'
import { request } from '@/utils/request'

// 动态导入 mock API（仅在需要时加载）
const getMockApi = () => {
  if (USE_MOCK) {
    return require('@/mock/api')
  }
  return null
}

export const authApi = {
  /**
   * 登录
   */
  login: (data: LoginForm) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.login(data)
    }
    // 后端接口：POST /auth/login，body: { phone, code }
    return request.post<{ token: string; user: User }>(API_ENDPOINTS.AUTH.LOGIN, {
      phone: data.phone,
      code: data.code,
    })
  },

  /**
   * 注册
   */
  register: (data: RegisterForm) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.register(data)
    }
    return request.post<{ token: string; user: User }>(API_ENDPOINTS.AUTH.REGISTER, data)
  },

  /**
   * 登出
   */
  logout: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.logout()
    }
    return request.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
  },

  /**
   * 刷新 token
   */
  refreshToken: (refreshToken: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.refreshToken(refreshToken)
    }
    return request.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    })
  },

  /**
   * 发送验证码
   */
  sendVerificationCode: (phone: string) => {
    // 后端接口使用 query 参数：POST /auth/verifyCode?phone=xxx
    const url = `${API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE}?phone=${encodeURIComponent(phone)}`
    return request.post<boolean>(url, undefined)
  },

  /**
   * 验证验证码
   */
  verifyCode: (phone: string, code: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.verifyCode(phone, code)
    }
    return request.post<{ verified: boolean }>(API_ENDPOINTS.AUTH.VERIFY_CODE, {
      phone,
      code,
    })
  },

  /**
   * 忘记密码
   */
  forgotPassword: (phone: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.forgotPassword(phone)
    }
    return request.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { phone })
  },

  /**
   * 重置密码
   */
  resetPassword: (phone: string, code: string, newPassword: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.resetPassword(phone, code, newPassword)
    }
    return request.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      phone,
      code,
      newPassword,
    })
  },
}

