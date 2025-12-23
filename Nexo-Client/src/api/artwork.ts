/**
 * 藏品相关 API
 * 封装藏品列表等请求
 */

import { API_ENDPOINTS } from '@/constants/api'
import { request } from '@/utils/request'
import { Artwork, QueryArtWorkRequest } from '@/types'

export const artworkApi = {
  /**
   * 获取藏品列表
   */
  list: (param: QueryArtWorkRequest) => {
    return request.get<Artwork[]>(API_ENDPOINTS.ARTWORK.LIST, param)
  },
}
