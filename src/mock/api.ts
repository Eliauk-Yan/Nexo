/**
 * Mock API 服务
 * 模拟后端 API 响应
 */

import {
    Collection,
    LoginForm,
    MarketFilters,
    MintForm,
    NFT,
    PaginationParams,
    RegisterForm,
    Transaction,
    User
} from '@/types'
import { getMockCollection, mockCollections } from './data/collections'
import { mockMarketStats } from './data/market'
import {
    getMockNFT,
    getMockNFTsByCreator,
    getMockNFTsByOwner,
    mockNFTs
} from './data/nfts'
import {
    getMockUnreadCount,
    mockNotifications,
} from './data/notifications'
import { getMockTransaction, mockTransactions } from './data/transactions'
import { mockCurrentUser, mockUserProfiles, mockUsers } from './data/users'
import { delay, paginate, randomDelay, searchFilter, sortData } from './utils'

// 认证相关 Mock API
export const mockAuthApi = {
  login: async (data: LoginForm) => {
    await randomDelay()
    
    // 模拟验证码验证
    if (data.code !== '123456') {
      throw { code: 400, message: '验证码错误' }
    }

    return {
      token: 'mock_jwt_token_' + Date.now(),
      user: mockCurrentUser,
    }
  },

  register: async (data: RegisterForm) => {
    await randomDelay()

    if (data.code !== '123456') {
      throw { code: 400, message: '验证码错误' }
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      username: data.username,
      phone: data.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return {
      token: 'mock_jwt_token_' + Date.now(),
      user: newUser,
    }
  },

  logout: async () => {
    await delay(300)
    return
  },

  refreshToken: async (refreshToken: string) => {
    await delay(300)
    return {
      token: 'mock_new_jwt_token_' + Date.now(),
    }
  },

  sendVerificationCode: async (phone: string) => {
    await randomDelay()
    // 模拟发送验证码，实际验证码为 123456
    console.log(`[Mock] 验证码已发送到 ${phone}，验证码：123456`)
    return
  },

  verifyCode: async (phone: string, code: string) => {
    await delay(500)
    return {
      verified: code === '123456',
    }
  },

  forgotPassword: async (phone: string) => {
    await randomDelay()
    return
  },

  resetPassword: async (phone: string, code: string, newPassword: string) => {
    await randomDelay()
    if (code !== '123456') {
      throw { code: 400, message: '验证码错误' }
    }
    return
  },
}

// 用户相关 Mock API
export const mockUserApi = {
  getProfile: async (userId?: string) => {
    await randomDelay()
    if (userId) {
      const user = mockUserProfiles.find((u) => u.id === userId)
      if (!user) throw { code: 404, message: '用户不存在' }
      return user
    }
    return mockCurrentUser
  },

  updateProfile: async (data: Partial<User>) => {
    await randomDelay()
    return { ...mockCurrentUser, ...data }
  },

  getWallet: async () => {
    await randomDelay()
    return {
      address: mockCurrentUser.walletAddress || '0x1234567890123456789012345678901234567890',
      chainId: 1,
      network: 'Ethereum Mainnet',
      balance: '10.5',
      connected: true,
    }
  },

  connectWallet: async (address: string, chainId: number) => {
    await randomDelay()
    return {
      address,
      chainId,
      network: 'Ethereum Mainnet',
      balance: '10.5',
      connected: true,
    }
  },

  disconnectWallet: async () => {
    await delay(300)
    return
  },

  getCollections: async (params?: PaginationParams) => {
    await randomDelay()
    const ownerNFTs = getMockNFTsByOwner(mockCurrentUser.walletAddress || '')
    return paginate(ownerNFTs, params?.page, params?.pageSize)
  },

  getCreated: async (params?: PaginationParams) => {
    await randomDelay()
    const createdNFTs = getMockNFTsByCreator(mockCurrentUser.walletAddress || '')
    return paginate(createdNFTs, params?.page, params?.pageSize)
  },

  getFavorites: async (params?: PaginationParams) => {
    await randomDelay()
    const favoriteNFTs = mockNFTs.filter((nft) => nft.isLiked)
    return paginate(favoriteNFTs, params?.page, params?.pageSize)
  },
}

// NFT 相关 Mock API
export const mockNftApi = {
  getList: async (params?: PaginationParams & MarketFilters) => {
    await randomDelay()
    let filtered = [...mockNFTs]

    // 应用过滤
    if (params) {
      if (params.category) {
        filtered = filtered.filter((nft) => nft.collectionName === params.category)
      }
      if (params.priceMin) {
        filtered = filtered.filter(
          (nft) => nft.price && parseFloat(nft.price) >= params.priceMin!
        )
      }
      if (params.priceMax) {
        filtered = filtered.filter(
          (nft) => nft.price && parseFloat(nft.price) <= params.priceMax!
        )
      }
      if (params.currency) {
        filtered = filtered.filter((nft) => nft.currency === params.currency)
      }
      if (params.sortBy) {
        filtered = sortData(filtered, params.sortBy, params.sortOrder)
      }
    }

    return paginate(filtered, params?.page, params?.pageSize)
  },

  getDetail: async (id: string | number) => {
    await randomDelay()
    const nft = getMockNFT(id)
    if (!nft) throw { code: 404, message: 'NFT 不存在' }
    return nft
  },

  create: async (data: MintForm) => {
    await randomDelay()
    const newNFT: NFT = {
      id: String(mockNFTs.length + 1),
      tokenId: String(mockNFTs.length + 1),
      name: data.name,
      description: data.description || '',
      image: data.image,
      collectionId: data.collectionId,
      collectionName: data.collectionId
        ? getMockCollection(data.collectionId)?.name
        : undefined,
      owner: mockCurrentUser.walletAddress || '',
      creator: mockCurrentUser.walletAddress || '',
      price: data.price,
      currency: data.currency || 'ETH',
      status: data.price ? 'listed' : 'draft',
      attributes: data.attributes || [],
      likes: 0,
      isLiked: false,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockNFTs.unshift(newNFT)
    return newNFT
  },

  update: async (id: string | number, data: Partial<MintForm>) => {
    await randomDelay()
    const nft = getMockNFT(id)
    if (!nft) throw { code: 404, message: 'NFT 不存在' }
    return { ...nft, ...data }
  },

  delete: async (id: string | number) => {
    await randomDelay()
    const index = mockNFTs.findIndex((nft) => nft.id === String(id))
    if (index === -1) throw { code: 404, message: 'NFT 不存在' }
    mockNFTs.splice(index, 1)
    return
  },

  like: async (id: string | number) => {
    await delay(300)
    const nft = getMockNFT(id)
    if (!nft) throw { code: 404, message: 'NFT 不存在' }
    nft.isLiked = true
    nft.likes += 1
    return
  },

  unlike: async (id: string | number) => {
    await delay(300)
    const nft = getMockNFT(id)
    if (!nft) throw { code: 404, message: 'NFT 不存在' }
    nft.isLiked = false
    nft.likes = Math.max(0, nft.likes - 1)
    return
  },

  transfer: async (id: string | number, to: string) => {
    await randomDelay()
    const nft = getMockNFT(id)
    if (!nft) throw { code: 404, message: 'NFT 不存在' }
    nft.owner = to
    return
  },

  mint: async (data: MintForm) => {
    await randomDelay()
    return mockNftApi.create(data)
  },
}

// 市场相关 Mock API
export const mockMarketApi = {
  getList: async (params?: PaginationParams & MarketFilters) => {
    await randomDelay()
    return mockNftApi.getList(params)
  },

  getTrending: async (params?: PaginationParams) => {
    await randomDelay()
    // 按热度排序（likes + views）
    const trending = [...mockNFTs]
      .sort((a, b) => (b.likes + b.views) - (a.likes + a.views))
      .slice(0, params?.pageSize || 20)
    return paginate(trending, params?.page, params?.pageSize)
  },

  getCategories: async () => {
    await delay(300)
    return Array.from(new Set(mockNFTs.map((nft) => nft.collectionName).filter(Boolean)))
  },

  search: async (keyword: string, params?: PaginationParams) => {
    await randomDelay()
    const results = searchFilter(mockNFTs, keyword, ['name', 'description', 'collectionName'])
    return paginate(results, params?.page, params?.pageSize)
  },

  getStats: async () => {
    await delay(500)
    return mockMarketStats
  },
}

// 收藏集相关 Mock API
export const mockCollectionApi = {
  getList: async (params?: PaginationParams) => {
    await randomDelay()
    return paginate(mockCollections, params?.page, params?.pageSize)
  },

  getDetail: async (id: string | number) => {
    await randomDelay()
    const collection = getMockCollection(id)
    if (!collection) throw { code: 404, message: '收藏集不存在' }
    return collection
  },

  create: async (data: Partial<Collection>) => {
    await randomDelay()
    const newCollection: Collection = {
      id: String(mockCollections.length + 1),
      name: data.name || 'New Collection',
      description: data.description,
      coverImage: data.coverImage,
      logoImage: data.logoImage,
      creator: mockCurrentUser.walletAddress || '',
      creatorName: mockCurrentUser.username,
      totalItems: 0,
      floorPrice: '0',
      totalVolume: '0',
      verified: false,
      createdAt: new Date().toISOString(),
    }
    mockCollections.push(newCollection)
    return newCollection
  },

  update: async (id: string | number, data: Partial<Collection>) => {
    await randomDelay()
    const collection = getMockCollection(id)
    if (!collection) throw { code: 404, message: '收藏集不存在' }
    return { ...collection, ...data }
  },

  delete: async (id: string | number) => {
    await randomDelay()
    const index = mockCollections.findIndex((c) => c.id === String(id))
    if (index === -1) throw { code: 404, message: '收藏集不存在' }
    mockCollections.splice(index, 1)
    return
  },
}

// 交易相关 Mock API
export const mockTransactionApi = {
  getList: async (params?: PaginationParams) => {
    await randomDelay()
    return paginate(mockTransactions, params?.page, params?.pageSize)
  },

  getDetail: async (id: string | number) => {
    await randomDelay()
    const transaction = getMockTransaction(id)
    if (!transaction) throw { code: 404, message: '交易不存在' }
    return transaction
  },

  create: async (data: Partial<Transaction>) => {
    await randomDelay()
    const newTransaction: Transaction = {
      id: String(mockTransactions.length + 1),
      nftId: data.nftId || '1',
      nftName: data.nftName || 'NFT',
      nftImage: data.nftImage || '',
      type: data.type || 'transfer',
      from: data.from || '',
      to: data.to || '',
      price: data.price || '0',
      currency: data.currency || 'ETH',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    mockTransactions.unshift(newTransaction)
    return newTransaction
  },

  getHistory: async (params?: PaginationParams) => {
    await randomDelay()
    return paginate(mockTransactions, params?.page, params?.pageSize)
  },
}

// 通知相关 Mock API
export const mockNotificationApi = {
  getList: async (params?: PaginationParams) => {
    await randomDelay()
    return paginate(mockNotifications, params?.page, params?.pageSize)
  },

  markAsRead: async (id: string | number) => {
    await delay(200)
    const notification = mockNotifications.find((n) => n.id === String(id))
    if (notification) {
      notification.read = true
    }
    return
  },

  markAllAsRead: async () => {
    await delay(300)
    mockNotifications.forEach((n) => {
      n.read = true
    })
    return
  },

  getUnreadCount: async () => {
    await delay(200)
    return getMockUnreadCount()
  },
}

// 上传相关 Mock API
export const mockUploadApi = {
  uploadImage: async (file: { uri: string; type: string; name: string }) => {
    await randomDelay()
    // 模拟上传，返回一个模拟的 URL
    return {
      url: file.uri.startsWith('http') ? file.uri : `https://mock-cdn.nexo.com/images/${Date.now()}.jpg`,
      key: `images/${Date.now()}.jpg`,
      size: 1024 * 1024, // 1MB
      mimeType: file.type || 'image/jpeg',
    }
  },

  uploadVideo: async (file: { uri: string; type: string; name: string }) => {
    await randomDelay()
    return {
      url: file.uri.startsWith('http') ? file.uri : `https://mock-cdn.nexo.com/videos/${Date.now()}.mp4`,
      key: `videos/${Date.now()}.mp4`,
      size: 10 * 1024 * 1024, // 10MB
      mimeType: file.type || 'video/mp4',
    }
  },

  uploadFile: async (file: { uri: string; type: string; name: string }) => {
    await randomDelay()
    return {
      url: file.uri.startsWith('http') ? file.uri : `https://mock-cdn.nexo.com/files/${Date.now()}`,
      key: `files/${Date.now()}`,
      size: 5 * 1024 * 1024, // 5MB
      mimeType: file.type || 'application/octet-stream',
    }
  },
}

