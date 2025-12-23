/**
 * 用户相关类型定义
 */

/**
 * 用户账户信息
 */
export interface UserProfile {
  id: string
  avatarUrl: string
  nickName: string
  phone: string
  alipay: string
  wechat: string
  appleId: string
  isVerified: boolean
  password: string
}

export interface UpdateUserRequest  {
  nickName?: string
  phone?: string
  password?: string
}