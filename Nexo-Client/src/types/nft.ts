/**
 * NFT 相关类型定义
 */

/**
 * NFT 状态
 */
export type NFTStatus = 'draft' | 'listed' | 'sold' | 'unlisted'

/**
 * NFT 属性
 */
export interface NFTAttribute {
  traitType: string
  value: string | number
}

/**
 * NFT 元数据
 */
export interface NFTMetadata {
  name: string
  description: string
  image: string
  animationUrl?: string
  externalUrl?: string
  attributes: NFTAttribute[]
}

/**
 * NFT 信息
 */
export interface NFT {
  id: string
  tokenId: string
  name: string
  description?: string
  image: string
  animationUrl?: string
  collectionId?: string
  collectionName?: string
  owner: string
  creator: string
  price?: string
  currency?: string
  status: NFTStatus
  attributes?: NFTAttribute[]
  likes: number
  isLiked: boolean
  views: number
  createdAt: string
  updatedAt: string
}

/**
 * 铸造表单
 */
export interface MintForm {
  name: string
  description: string
  image: string
  collectionId?: string
  attributes?: NFTAttribute[]
  price?: string
  currency?: string
}








