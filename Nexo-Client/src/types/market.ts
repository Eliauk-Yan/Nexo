/**
 * 市场相关类型定义
 */

/**
 * 市场统计数据
 */
export interface MarketStats {
  totalVolume: string
  totalSales: number
  averagePrice: string
  floorPrice: string
  activeUsers: number
}

/**
 * 市场筛选条件
 */
export interface MarketFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  currency?: string
  sortBy?: 'price' | 'date' | 'likes' | 'views'
  sortOrder?: 'asc' | 'desc'
}








