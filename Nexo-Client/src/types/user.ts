/**
 * 用户相关类型定义
 */

export interface UserProfile {
  id: string
  avatarUrl: string
  nickName: string
  phone: string
  alipay: string
  wechat: string
  appleId: string
  realNameAuth: boolean
  password: string
}

export interface UpdateUserRequest {
  nickName?: string
  phone?: string
  password?: string
}

export interface RealNameAuthDTO {
  realName: string
  idCardNo: string
}
