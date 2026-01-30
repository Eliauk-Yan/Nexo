import { API_ENDPOINTS } from '@/constants/api'
import { request } from '@/utils/request'

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
    return request.get<UserProfile>(API_ENDPOINTS.USER.PROFILE)
  },

  /**
   * 更新用户昵称
   * @param data 更新数据
   * @returns 更新结果
   */
  updateNickName: (data: UpdateUserRequest) => {
    return request.put<boolean>(API_ENDPOINTS.USER.UPDATE_NICK_NAME, data)
  },

  realNameAuthentication: (data: RealNameAuthDTO) => {
    return request.post<boolean>(API_ENDPOINTS.USER.REAL_NAME_AUTH, data)
  },
}
