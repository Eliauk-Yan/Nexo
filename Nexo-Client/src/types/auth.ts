/**
 * 认证相关类型定义
 */


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

