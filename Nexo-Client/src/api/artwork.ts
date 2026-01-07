/**
 * 藏品相关 API
 * 封装藏品列表等请求
 */

import { API_ENDPOINTS } from '@/constants/api'
import { Artwork, ArtworkDetail, QueryArtWorkRequest } from '@/types'
import { request } from '@/utils/request'

export const artworkApi = {
  /**
   * 获取藏品列表
   */
  list: (param: QueryArtWorkRequest) => {
    return request.get<Artwork[]>(API_ENDPOINTS.ARTWORK.LIST, param)
  },

  /**
   * 获取藏品详情
   */
  getDetail: (id: number) => {
    return request.get<ArtworkDetail>(`${API_ENDPOINTS.ARTWORK.DETAIL}/${id}`)
  },
}
