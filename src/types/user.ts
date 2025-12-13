/**
 * 用户相关类型定义
 */

/**
 * 用户基本信息
 */
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

/**
 * 用户详细信息（包含统计数据）
 */
export interface UserProfile extends User {
  followers: number
  following: number
  totalVolume: number
  totalNFTs: number
  collections: number
}

/**
 * 钱包信息
 */
export interface Wallet {
  address: string
  chainId: number
  network: string
  balance: string
  connected: boolean
}

