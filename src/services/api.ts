/**
 * API 服务层
 * 封装所有 API 请求方法
 * 支持 Mock 模式和真实 API 模式切换
 */

import { USE_MOCK } from '@/config/env'
import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import {
  User,
  UserProfile,
  Wallet,
  NFT,
  PaginationParams,
  PaginationResponse,
  Collection,
  Transaction,
  MarketStats,
  MarketFilters,
  Notification,
  UploadResponse,
  LoginForm,
  RegisterForm,
  MintForm,
} from '@/types'

// 动态导入 mock API（仅在需要时加载）
const getMockApi = () => {
  if (USE_MOCK) {
    return require('@/mock/api')
  }
  return null
}

// 认证相关 API
export const authApi = {
  /**
   * 登录
   */
  login: (data: LoginForm) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.login(data)
    }
    return request.post<{ token: string; user: User }>(API_ENDPOINTS.AUTH.LOGIN, data)
  },

  /**
   * 注册
   */
  register: (data: RegisterForm) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.register(data)
    }
    return request.post<{ token: string; user: User }>(API_ENDPOINTS.AUTH.REGISTER, data)
  },

  /**
   * 登出
   */
  logout: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.logout()
    }
    return request.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
  },

  /**
   * 刷新 token
   */
  refreshToken: (refreshToken: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.refreshToken(refreshToken)
    }
    return request.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    })
  },

  /**
   * 发送验证码
   */
  sendVerificationCode: (phone: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.sendVerificationCode(phone)
    }
    return request.post<void>(API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE, { phone })
  },

  /**
   * 验证验证码
   */
  verifyCode: (phone: string, code: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.verifyCode(phone, code)
    }
    return request.post<{ verified: boolean }>(API_ENDPOINTS.AUTH.VERIFY_CODE, {
      phone,
      code,
    })
  },

  /**
   * 忘记密码
   */
  forgotPassword: (phone: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.forgotPassword(phone)
    }
    return request.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { phone })
  },

  /**
   * 重置密码
   */
  resetPassword: (phone: string, code: string, newPassword: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockAuthApi.resetPassword(phone, code, newPassword)
    }
    return request.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      phone,
      code,
      newPassword,
    })
  },
}

// 用户相关 API
export const userApi = {
  /**
   * 获取用户信息
   */
  getProfile: (userId?: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUserApi.getProfile(userId)
    }
    const url = userId ? `${API_ENDPOINTS.USER.PROFILE}/${userId}` : API_ENDPOINTS.USER.PROFILE
    return request.get<UserProfile>(url)
  },

  /**
   * 更新用户信息
   */
  updateProfile: (data: Partial<User>) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUserApi.updateProfile(data)
    }
    return request.put<User>(API_ENDPOINTS.USER.UPDATE_PROFILE, data)
  },

  /**
   * 获取钱包信息
   */
  getWallet: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockUserApi.getWallet()
    }
    return request.get<Wallet>(API_ENDPOINTS.USER.WALLET)
  },

  /**
   * 连接钱包
   */
  connectWallet: (address: string, chainId: number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUserApi.connectWallet(address, chainId)
    }
    return request.post<Wallet>(API_ENDPOINTS.USER.CONNECT_WALLET, { address, chainId })
  },

  /**
   * 断开钱包
   */
  disconnectWallet: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockUserApi.disconnectWallet()
    }
    return request.post<void>(API_ENDPOINTS.USER.DISCONNECT_WALLET)
  },

  /**
   * 获取收藏的 NFT
   */
  getCollections: (params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUserApi.getCollections(params)
    }
    return request.get<PaginationResponse<NFT>>(API_ENDPOINTS.USER.COLLECTIONS, params)
  },

  /**
   * 获取创建的 NFT
   */
  getCreated: (params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUserApi.getCreated(params)
    }
    return request.get<PaginationResponse<NFT>>(API_ENDPOINTS.USER.CREATED, params)
  },

  /**
   * 获取喜欢的 NFT
   */
  getFavorites: (params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUserApi.getFavorites(params)
    }
    return request.get<PaginationResponse<NFT>>(API_ENDPOINTS.USER.FAVORITES, params)
  },
}

// NFT 相关 API
export const nftApi = {
  /**
   * 获取 NFT 列表
   */
  getList: (params?: PaginationParams & MarketFilters) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.getList(params)
    }
    return request.get<PaginationResponse<NFT>>(API_ENDPOINTS.NFT.LIST, params)
  },

  /**
   * 获取 NFT 详情
   */
  getDetail: (id: string | number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.getDetail(id)
    }
    return request.get<NFT>(API_ENDPOINTS.NFT.DETAIL(id))
  },

  /**
   * 创建 NFT
   */
  create: (data: MintForm) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.create(data)
    }
    return request.post<NFT>(API_ENDPOINTS.NFT.CREATE, data)
  },

  /**
   * 更新 NFT
   */
  update: (id: string | number, data: Partial<MintForm>) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.update(id, data)
    }
    return request.put<NFT>(API_ENDPOINTS.NFT.UPDATE(id), data)
  },

  /**
   * 删除 NFT
   */
  delete: (id: string | number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.delete(id)
    }
    return request.delete<void>(API_ENDPOINTS.NFT.DELETE(id))
  },

  /**
   * 点赞 NFT
   */
  like: (id: string | number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.like(id)
    }
    return request.post<void>(API_ENDPOINTS.NFT.LIKE(id))
  },

  /**
   * 取消点赞
   */
  unlike: (id: string | number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.unlike(id)
    }
    return request.post<void>(API_ENDPOINTS.NFT.UNLIKE(id))
  },

  /**
   * 转移 NFT
   */
  transfer: (id: string | number, to: string) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.transfer(id, to)
    }
    return request.post<void>(API_ENDPOINTS.NFT.TRANSFER(id), { to })
  },

  /**
   * 铸造 NFT
   */
  mint: (data: MintForm) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNftApi.mint(data)
    }
    return request.post<NFT>(API_ENDPOINTS.NFT.MINT, data)
  },
}

// 市场相关 API
export const marketApi = {
  /**
   * 获取市场列表
   */
  getList: (params?: PaginationParams & MarketFilters) => {
    if (USE_MOCK) {
      return getMockApi()?.mockMarketApi.getList(params)
    }
    return request.get<PaginationResponse<NFT>>(API_ENDPOINTS.MARKET.LIST, params)
  },

  /**
   * 获取热门 NFT
   */
  getTrending: (params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockMarketApi.getTrending(params)
    }
    return request.get<PaginationResponse<NFT>>(API_ENDPOINTS.MARKET.TRENDING, params)
  },

  /**
   * 获取分类列表
   */
  getCategories: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockMarketApi.getCategories()
    }
    return request.get<string[]>(API_ENDPOINTS.MARKET.CATEGORIES)
  },

  /**
   * 搜索 NFT
   */
  search: (keyword: string, params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockMarketApi.search(keyword, params)
    }
    return request.get<PaginationResponse<NFT>>(API_ENDPOINTS.MARKET.SEARCH, {
      keyword,
      ...params,
    })
  },

  /**
   * 获取市场统计
   */
  getStats: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockMarketApi.getStats()
    }
    return request.get<MarketStats>(API_ENDPOINTS.MARKET.STATS)
  },
}

// 收藏集相关 API
export const collectionApi = {
  /**
   * 获取收藏集列表
   */
  getList: (params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockCollectionApi.getList(params)
    }
    return request.get<PaginationResponse<Collection>>(API_ENDPOINTS.COLLECTION.LIST, params)
  },

  /**
   * 获取收藏集详情
   */
  getDetail: (id: string | number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockCollectionApi.getDetail(id)
    }
    return request.get<Collection>(API_ENDPOINTS.COLLECTION.DETAIL(id))
  },

  /**
   * 创建收藏集
   */
  create: (data: Partial<Collection>) => {
    if (USE_MOCK) {
      return getMockApi()?.mockCollectionApi.create(data)
    }
    return request.post<Collection>(API_ENDPOINTS.COLLECTION.CREATE, data)
  },

  /**
   * 更新收藏集
   */
  update: (id: string | number, data: Partial<Collection>) => {
    if (USE_MOCK) {
      return getMockApi()?.mockCollectionApi.update(id, data)
    }
    return request.put<Collection>(API_ENDPOINTS.COLLECTION.UPDATE(id), data)
  },

  /**
   * 删除收藏集
   */
  delete: (id: string | number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockCollectionApi.delete(id)
    }
    return request.delete<void>(API_ENDPOINTS.COLLECTION.DELETE(id))
  },
}

// 交易相关 API
export const transactionApi = {
  /**
   * 获取交易列表
   */
  getList: (params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockTransactionApi.getList(params)
    }
    return request.get<PaginationResponse<Transaction>>(API_ENDPOINTS.TRANSACTION.LIST, params)
  },

  /**
   * 获取交易详情
   */
  getDetail: (id: string | number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockTransactionApi.getDetail(id)
    }
    return request.get<Transaction>(API_ENDPOINTS.TRANSACTION.DETAIL(id))
  },

  /**
   * 创建交易
   */
  create: (data: Partial<Transaction>) => {
    if (USE_MOCK) {
      return getMockApi()?.mockTransactionApi.create(data)
    }
    return request.post<Transaction>(API_ENDPOINTS.TRANSACTION.CREATE, data)
  },

  /**
   * 获取交易历史
   */
  getHistory: (params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockTransactionApi.getHistory(params)
    }
    return request.get<PaginationResponse<Transaction>>(API_ENDPOINTS.TRANSACTION.HISTORY, params)
  },
}

// 通知相关 API
export const notificationApi = {
  /**
   * 获取通知列表
   */
  getList: (params?: PaginationParams) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNotificationApi.getList(params)
    }
    return request.get<PaginationResponse<Notification>>(API_ENDPOINTS.NOTIFICATION.LIST, params)
  },

  /**
   * 标记通知为已读
   */
  markAsRead: (id: string | number) => {
    if (USE_MOCK) {
      return getMockApi()?.mockNotificationApi.markAsRead(id)
    }
    return request.post<void>(API_ENDPOINTS.NOTIFICATION.READ(id))
  },

  /**
   * 标记所有通知为已读
   */
  markAllAsRead: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockNotificationApi.markAllAsRead()
    }
    return request.post<void>(API_ENDPOINTS.NOTIFICATION.READ_ALL)
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockNotificationApi.getUnreadCount()
    }
    return request.get<number>(API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT)
  },
}

// 上传相关 API
export const uploadApi = {
  /**
   * 上传图片
   */
  uploadImage: (file: { uri: string; type: string; name: string }) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUploadApi.uploadImage(file)
    }
    return request.upload<UploadResponse>(API_ENDPOINTS.UPLOAD.IMAGE, file)
  },

  /**
   * 上传视频
   */
  uploadVideo: (file: { uri: string; type: string; name: string }) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUploadApi.uploadVideo(file)
    }
    return request.upload<UploadResponse>(API_ENDPOINTS.UPLOAD.VIDEO, file)
  },

  /**
   * 上传文件
   */
  uploadFile: (file: { uri: string; type: string; name: string }) => {
    if (USE_MOCK) {
      return getMockApi()?.mockUploadApi.uploadFile(file)
    }
    return request.upload<UploadResponse>(API_ENDPOINTS.UPLOAD.FILE, file)
  },
}
