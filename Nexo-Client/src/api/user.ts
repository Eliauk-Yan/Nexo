/**
 * 认证相关 API
 * 封装所有认证相关的 API 请求方法
 */

import { API_ENDPOINTS } from '@/constants/api'
import { UpdateUserRequest, UserProfile } from '@/types'
import { request } from '@/utils/request'

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
}
