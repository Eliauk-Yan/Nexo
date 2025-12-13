/**
 * 市场相关 Hook
 * 管理市场数据、统计、搜索等
 */

import { useState, useEffect, useCallback } from 'react'
// TODO: 实现 marketApi
// import { marketApi } from '@/api'
import { NFT, MarketStats, MarketFilters, PaginationParams } from '@/types'

interface UseMarketListParams extends PaginationParams, MarketFilters {}

interface UseMarketListReturn {
  nfts: NFT[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
}

/**
 * 获取市场 NFT 列表
 */
export const useMarketList = (params?: UseMarketListParams): UseMarketListReturn => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const pageSize = params?.pageSize || 20

  const fetchNFTs = useCallback(
    async (pageNum: number, append = false) => {
      try {
        setLoading(true)
        setError(null)
        // TODO: 实现 marketApi 后恢复此功能
        // const response = await marketApi.getList({
        //   ...params,
        //   page: pageNum,
        //   pageSize,
        // })
        // if (append) {
        //   setNfts((prev) => [...prev, ...response.list])
        // } else {
        //   setNfts(response.list)
        // }
        // setHasMore(response.page < response.totalPages)
        
        // 暂时返回空数据
        if (!append) {
          setNfts([])
        }
        setHasMore(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch market NFTs'))
        console.error('Fetch market NFTs error:', err)
      } finally {
        setLoading(false)
      }
    },
    [params, pageSize]
  )

  useEffect(() => {
    fetchNFTs(1, false)
  }, [params])

  const refresh = useCallback(async () => {
    setPage(1)
    await fetchNFTs(1, false)
  }, [fetchNFTs])

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      await fetchNFTs(nextPage, true)
    }
  }, [loading, hasMore, page, fetchNFTs])

  return {
    nfts,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  }
}

interface UseMarketStatsReturn {
  stats: MarketStats | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * 获取市场统计
 */
export const useMarketStats = (): UseMarketStatsReturn => {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: 实现 marketApi 后恢复此功能
      // const data = await marketApi.getStats()
      // setStats(data)
      setStats(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch market stats'))
      console.error('Fetch market stats error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}

interface UseMarketSearchReturn {
  nfts: NFT[]
  loading: boolean
  error: Error | null
  search: (keyword: string) => Promise<void>
  clear: () => void
}

/**
 * 市场搜索
 */
export const useMarketSearch = (): UseMarketSearchReturn => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setNfts([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      // TODO: 实现 marketApi 后恢复此功能
      // const response = await marketApi.search(keyword)
      // setNfts(response.list)
      setNfts([])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'))
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setNfts([])
    setError(null)
  }, [])

  return {
    nfts,
    loading,
    error,
    search,
    clear,
  }
}

/**
 * 获取热门 NFT
 */
export const useTrendingNFTs = (limit = 10) => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: 实现 marketApi 后恢复此功能
      // const response = await marketApi.getTrending({ page: 1, pageSize: limit })
      // setNfts(response.list)
      setNfts([])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch trending NFTs'))
      console.error('Fetch trending NFTs error:', err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchTrending()
  }, [fetchTrending])

  return {
    nfts,
    loading,
    error,
    refresh: fetchTrending,
  }
}

