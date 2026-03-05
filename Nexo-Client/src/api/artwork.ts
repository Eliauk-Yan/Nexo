import { get } from '@/utils/request'

export interface Artwork {
  id: number
  name: string
  cover: string
  price: number
  quantity: number
  inventory: number | null
  saleTime: string | null
  bookStartTime: string | null
  bookEndTime: string | null
  canBook: boolean
  hasBooked: boolean | null
  productState: 'NOT_FOR_SALE' | 'SELLING' | 'SOLD_OUT' | 'COMING_SOON' | 'WAIT_FOR_SALE'
}

export interface ArtworkDetail {
  id: number
  name: string
  cover: string
  price: number
  quantity: number
  inventory: number | null
  saleTime: string | null
  bookStartTime: string | null
  bookEndTime: string | null
  canBook: boolean
  hasBooked: boolean | null
  productState: 'NOT_FOR_SALE' | 'SELLING' | 'SOLD_OUT' | 'COMING_SOON' | 'WAIT_FOR_SALE'
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
    return get<Artwork[]>('/artwork/list', param)
  },

  /**
   * 获取藏品详情
   */
  getDetail: (id: number) => {
    return get<ArtworkDetail>(`/artwork/${id}`)
  },
}
