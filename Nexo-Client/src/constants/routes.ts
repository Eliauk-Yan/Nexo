/**
 * 路由常量
 * 统一管理应用的所有路由路径
 */

export const ROUTES = {
  // 认证相关
  AUTH: {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },

  // 主页面
  TABS: {
    HOME: '/(tabs)/',

    MINT: '/(tabs)/mint',
    MARKET: '/(tabs)/market',
    ACCOUNT: '/(tabs)/account',
  },

  // NFT 相关
  NFT: {
    DETAIL: '/nft/detail',
    COLLECTION: '/nft/collection',
    CREATE: '/nft/create',
    EDIT: '/nft/edit',
  },

  // 用户相关
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/setting',
    WALLET: '/user/wallet',
    COLLECTIONS: '/user/collections',
    CREATED: '/user/created',
    FAVORITES: '/user/favorites',
  },

  // 市场相关
  MARKET: {
    LIST: '/market/list',
    CATEGORIES: '/market/categories',
    SEARCH: '/market/search',
  },
} as const

