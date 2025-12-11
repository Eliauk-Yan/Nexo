/**
 * TypeScript 类型定义
 * 统一管理应用中的所有类型和接口
 */

// 通用类型
export interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户相关
export interface User {
  id: string
  username: string
  email?: string
  phone?: string
  avatar?: string
  bio?: string
  walletAddress?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  followers: number
  following: number
  totalVolume: number
  totalNFTs: number
  collections: number
}

export interface Wallet {
  address: string
  chainId: number
  network: string
  balance: string
  connected: boolean
}

// NFT 相关
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

export type NFTStatus = 'draft' | 'listed' | 'sold' | 'unlisted'

export interface NFTAttribute {
  traitType: string
  value: string | number
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  animationUrl?: string
  externalUrl?: string
  attributes: NFTAttribute[]
}

// 收藏集相关
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

// 交易相关
export interface Transaction {
  id: string
  nftId: string
  nftName: string
  nftImage: string
  type: TransactionType
  from: string
  to: string
  price: string
  currency: string
  status: TransactionStatus
  txHash?: string
  createdAt: string
}

export type TransactionType = 'mint' | 'transfer' | 'sale' | 'list' | 'cancel'
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled'

// 市场相关
export interface MarketStats {
  totalVolume: string
  totalSales: number
  averagePrice: string
  floorPrice: string
  activeUsers: number
}

export interface MarketFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  currency?: string
  sortBy?: 'price' | 'date' | 'likes' | 'views'
  sortOrder?: 'asc' | 'desc'
}

// 通知相关
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
}

export type NotificationType =
  | 'like'
  | 'comment'
  | 'sale'
  | 'offer'
  | 'transfer'
  | 'system'

// 上传相关
export interface UploadResponse {
  url: string
  key: string
  size: number
  mimeType: string
}

// 表单相关
export interface LoginForm {
  phone: string
  code: string
}

export interface RegisterForm {
  username: string
  phone: string
  code: string
  password: string
  confirmPassword: string
}

export interface MintForm {
  name: string
  description: string
  image: string
  collectionId?: string
  attributes?: NFTAttribute[]
  price?: string
  currency?: string
}

// API 错误
export interface ApiError {
  code: number
  message: string
  details?: any
}

