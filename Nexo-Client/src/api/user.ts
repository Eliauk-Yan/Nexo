import { get, put, post } from '@/utils/request'

/** 与后端 UserInfo 一致，/user/profile 返回此类型 */
export interface UserInfo {
  id: string | number
  nickName?: string
  avatarUrl?: string
  role?: string
  state?: string
  phone?: string
  email?: string
  /** 链地址/钱包地址 */
  account?: string
  /** 实名认证状态 */
  certification?: boolean
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
   * 获取用户信息（与后端 Result&lt;UserInfo&gt; 一致）
   */
  getUserProfile: () => {
    return get<UserInfo>('/user/profile')
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
