/**
 * 收藏集相关类型定义
 */

/**
 * 收藏集信息
 */
export interface Collection {
  id: string
  name: string
  description?: string
  coverImage?: string
  logoImage?: string
  creator: string
  creatorName: string
  totalItems: number
  floorPrice?: string
  totalVolume: string
  verified: boolean
  createdAt: string
}




