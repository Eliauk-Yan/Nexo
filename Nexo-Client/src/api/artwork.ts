import { API_ENDPOINTS } from '@/constants/api'
import { request } from '@/utils/request'

export interface Artwork {
  id: number
  name: string
  cover: string
  price: number
  quantity: number
  inventory: number | null
  saleTime: string | null
  version: number
  bookStartTime: string | null
  bookEndTime: string | null
  canBook: boolean
  hasBooked: boolean | null
}

export interface ArtworkDetail {
  id: number
  name: string
  cover: string
  price: number
  quantity: number
  inventory: number | null
  saleTime: string | null
  version: number
  bookStartTime: string | null
  bookEndTime: string | null
  canBook: boolean
  hasBooked: boolean | null
}

export interface QueryArtWorkRequest {
  currentPage: number
  pageSize: number
  keyword?: string
}

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
