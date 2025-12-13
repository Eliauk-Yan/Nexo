/**
 * 认证相关类型定义
 */

/**
 * 登录表单
 */
export interface LoginForm {
  phone: string
  code: string
}

/**
 * 注册表单
 */
export interface RegisterForm {
  username: string
  phone: string
  code: string
  password: string
  confirmPassword: string
}

