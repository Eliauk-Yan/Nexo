import { get, put, post } from '@/utils/request'

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

export const userApi = {
  /**
   * 获取用户账户信息
   * @returns 账户信息
   */
  getUserProfile: () => {
    return get<UserProfile>('/user/profile')
  },

  /**
   * 更新用户昵称
   * @param data 更新数据
   * @returns 更新结果
   */
  updateNickName: (data: UpdateUserRequest) => {
    return put<boolean>('/user/nickName', data)
  },

  /**
   * 用户实名认证
   * @param data
   */
  realNameAuthentication: (data: RealNameAuthDTO) => {
    return post<boolean>('/user/realNameAuth', data)
  },

  /**
   * 更新用户头像
   * @param data
   */
  updateAvatar: (data: FormData) => {
    return put<string>('/user/avatar', data)
  },
}
