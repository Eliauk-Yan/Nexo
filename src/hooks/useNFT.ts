/**
 * NFT 相关 Hook
 * 管理 NFT 列表、详情、操作等
 */

import { useState, useEffect, useCallback } from 'react'
// TODO: 实现 nftApi
// import { nftApi } from '@/api'
import { NFT, PaginationParams, MarketFilters } from '@/types'

interface UseNFTListParams extends PaginationParams, MarketFilters {}

interface UseNFTListReturn {
  nfts: NFT[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
}

/**
 * 获取 NFT 列表
 */
export const useNFTList = (params?: UseNFTListParams): UseNFTListReturn => {
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
        // TODO: 实现 nftApi 后恢复此功能
        // const response = await nftApi.getList({
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
        setError(err instanceof Error ? err : new Error('Failed to fetch NFTs'))
        console.error('Fetch NFTs error:', err)
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

interface UseNFTDetailReturn {
  nft: NFT | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  like: () => Promise<void>
  unlike: () => Promise<void>
}

/**
 * 获取 NFT 详情
 */
export const useNFTDetail = (id: string | number): UseNFTDetailReturn => {
  const [nft, setNft] = useState<NFT | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: 实现 nftApi 后恢复此功能
      // const data = await nftApi.getDetail(id)
      // setNft(data)
      setNft(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch NFT detail'))
      console.error('Fetch NFT detail error:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const like = useCallback(async () => {
    if (!nft) return
    try {
      // TODO: 实现 nftApi 后恢复此功能
      // await nftApi.like(id)
      setNft({
        ...nft,
        isLiked: true,
        likes: nft.likes + 1,
      })
    } catch (err) {
      console.error('Like NFT error:', err)
      throw err
    }
  }, [id, nft])

  const unlike = useCallback(async () => {
    if (!nft) return
    try {
      // TODO: 实现 nftApi 后恢复此功能
      // await nftApi.unlike(id)
      setNft({
        ...nft,
        isLiked: false,
        likes: Math.max(0, nft.likes - 1),
      })
    } catch (err) {
      console.error('Unlike NFT error:', err)
      throw err
    }
  }, [id, nft])

  return {
    nft,
    loading,
    error,
    refresh: fetchDetail,
    like,
    unlike,
  }
}

