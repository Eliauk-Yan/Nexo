/**
 * 藏品相关类型定义
 */

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
