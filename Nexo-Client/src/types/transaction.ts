/**
 * 交易相关类型定义
 */

/**
 * 交易类型
 */
export type TransactionType = 'mint' | 'transfer' | 'sale' | 'list' | 'cancel'

/**
 * 交易状态
 */
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled'

/**
 * 交易信息
 */
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








