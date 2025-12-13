/**
 * API 端点常量
 * 统一管理所有 API 接口路径
 */

const API_PREFIX = '/api/v1'

export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: `/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    REFRESH_TOKEN: `${API_PREFIX}/auth/refresh`,
    SEND_VERIFICATION_CODE: `/auth/verifyCode`,
    VERIFY_CODE: `${API_PREFIX}/auth/verify-code`,
    FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
    RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
  },
  
  // 用户相关
  USER: {
    PROFILE: `${API_PREFIX}/user/profile`,
    UPDATE_PROFILE: `${API_PREFIX}/user/profile`,
    WALLET: `${API_PREFIX}/user/wallet`,
    CONNECT_WALLET: `${API_PREFIX}/user/wallet/connect`,
    DISCONNECT_WALLET: `${API_PREFIX}/user/wallet/disconnect`,
    COLLECTIONS: `${API_PREFIX}/user/collections`,
    CREATED: `${API_PREFIX}/user/created`,
    FAVORITES: `${API_PREFIX}/user/favorites`,
  },
  
  // NFT 相关
  NFT: {
    LIST: `${API_PREFIX}/nft`,
    DETAIL: (id: string | number) => `${API_PREFIX}/nft/${id}`,
    CREATE: `${API_PREFIX}/nft`,
    UPDATE: (id: string | number) => `${API_PREFIX}/nft/${id}`,
    DELETE: (id: string | number) => `${API_PREFIX}/nft/${id}`,
    LIKE: (id: string | number) => `${API_PREFIX}/nft/${id}/like`,
    UNLIKE: (id: string | number) => `${API_PREFIX}/nft/${id}/unlike`,
    TRANSFER: (id: string | number) => `${API_PREFIX}/nft/${id}/transfer`,
    MINT: `${API_PREFIX}/nft/mint`,
  },
  
  // 市场相关
  MARKET: {
    LIST: `${API_PREFIX}/market`,
    TRENDING: `${API_PREFIX}/market/trending`,
    CATEGORIES: `${API_PREFIX}/market/categories`,
    SEARCH: `${API_PREFIX}/market/search`,
    STATS: `${API_PREFIX}/market/stats`,
  },
  
  // 收藏集相关
  COLLECTION: {
    LIST: `${API_PREFIX}/collection`,
    DETAIL: (id: string | number) => `${API_PREFIX}/collection/${id}`,
    CREATE: `${API_PREFIX}/collection`,
    UPDATE: (id: string | number) => `${API_PREFIX}/collection/${id}`,
    DELETE: (id: string | number) => `${API_PREFIX}/collection/${id}`,
  },
  
  // 交易相关
  TRANSACTION: {
    LIST: `${API_PREFIX}/transaction`,
    DETAIL: (id: string | number) => `${API_PREFIX}/transaction/${id}`,
    CREATE: `${API_PREFIX}/transaction`,
    HISTORY: `${API_PREFIX}/transaction/history`,
  },
  
  // 通知相关
  NOTIFICATION: {
    LIST: `${API_PREFIX}/notification`,
    READ: (id: string | number) => `${API_PREFIX}/notification/${id}/read`,
    READ_ALL: `${API_PREFIX}/notification/read-all`,
    UNREAD_COUNT: `${API_PREFIX}/notification/unread-count`,
  },
  
  // 上传相关
  UPLOAD: {
    IMAGE: `${API_PREFIX}/upload/image`,
    VIDEO: `${API_PREFIX}/upload/video`,
    FILE: `${API_PREFIX}/upload/file`,
  },
} as const

