/**
 * 环境变量配置
 * 根据不同的环境（开发、测试、生产）加载不同的配置
 */

export type EnvType = 'development' | 'staging' | 'production'

const getEnv = (): EnvType => {
  if (__DEV__) {
    return 'development'
  }
  // 可以根据需要添加 staging 环境判断
  return 'production'
}

export const ENV = getEnv()

// API 配置
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
  },
  staging: {
    baseURL: 'https://staging-api.nexo.com/api',
    timeout: 15000,
  },
  production: {
    baseURL: 'https://api.nexo.com/api',
    timeout: 15000,
  },
}

export const API_BASE_URL = API_CONFIG[ENV].baseURL
export const API_TIMEOUT = API_CONFIG[ENV].timeout

// 应用配置
export const APP_CONFIG = {
  name: 'Nexo',
  version: '1.0.0',
  supportEmail: 'support@nexo.com',
}

// 区块链配置
export const BLOCKCHAIN_CONFIG = {
  defaultChainId: 1, // Ethereum Mainnet
  supportedChains: [1, 137, 56], // Ethereum, Polygon, BSC
  rpcUrls: {
    1: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    137: 'https://polygon-rpc.com',
    56: 'https://bsc-dataseed.binance.org',
  },
}

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: '@nexo:token',
  USER_INFO: '@nexo:userInfo',
  WALLET_ADDRESS: '@nexo:walletAddress',
  LANGUAGE: '@nexo:language',
  THEME: '@nexo:theme',
}

// Mock 配置
// 设置为 true 时使用 mock 数据，false 时使用真实 API
// 可以通过环境变量或配置文件控制
export const USE_MOCK = __DEV__ && true // 开发环境默认使用 mock，可根据需要修改

// Mock 延迟配置（毫秒）
export const MOCK_DELAY = {
  min: 300,
  max: 1500,
}

